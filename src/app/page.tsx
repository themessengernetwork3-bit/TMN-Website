"use client";

import { useMemo, useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Logo from "@/components/Logo";
import CleaningTypeStep from "@/components/CleaningTypeStep";
import OptOutStep, { sheetKey } from "@/components/OptOutStep";
import CustomerStep from "@/components/CustomerStep";
import ResultsStep from "@/components/ResultsStep";
import type { ColumnRole } from "@/components/ColumnMapper";
import { parseUploadedFile } from "@/lib/parseFile";
import { detectColumns, OPT_OUT_SHEET_NAME_PATTERN } from "@/lib/columnDetect";
import { buildOptOutSet, scrubCustomerSheet } from "@/lib/scrub";
import { buildCanonicalOutput, type CanonicalOutput } from "@/lib/canonicalOutput";
import type {
  CleaningType,
  CustomerSheetConfig,
  OptOutSheetConfig,
  ParsedFile,
  ParsedSheet,
  ScrubResult,
} from "@/lib/types";

type RolesMap = Record<number, ColumnRole>;

function rolesFromDetection(headers: string[]): RolesMap {
  const detection = detectColumns(headers);
  const roles: RolesMap = {};
  detection.phoneCandidates.forEach((i) => (roles[i] = "phone"));
  if (detection.countryCodeCandidate !== null) roles[detection.countryCodeCandidate] = "countrycode";
  if (detection.nameCandidate !== null && !(detection.nameCandidate in roles)) {
    roles[detection.nameCandidate] = "name";
  }
  return roles;
}

function rolesToConfig(roles: RolesMap): {
  phoneColIndexes: number[];
  countryCodeColIndex: number | null;
  nameColIndex: number | null;
} {
  const phoneColIndexes: number[] = [];
  let countryCodeColIndex: number | null = null;
  let nameColIndex: number | null = null;
  for (const [idxStr, role] of Object.entries(roles)) {
    const idx = Number(idxStr);
    if (role === "phone") phoneColIndexes.push(idx);
    if (role === "countrycode") countryCodeColIndex = idx;
    if (role === "name") nameColIndex = idx;
  }
  phoneColIndexes.sort((a, b) => a - b);
  return { phoneColIndexes, countryCodeColIndex, nameColIndex };
}

const STEPS_BASIC = ["Cleaning type", "Customer database", "Summary"];
const STEPS_OPTOUT = ["Cleaning type", "Opt-out list", "Customer database", "Summary"];

export default function Home() {
  const [step, setStep] = useState(0);
  const [cleaningType, setCleaningType] = useState<CleaningType | null>(null);
  const [defaultCountryCode, setDefaultCountryCode] = useState("27");

  // --- Opt-out state ---
  const [optOutFiles, setOptOutFiles] = useState<ParsedFile[]>([]);
  const [optOutRoles, setOptOutRoles] = useState<Record<string, RolesMap>>({});
  const [optOutIncluded, setOptOutIncluded] = useState<Record<string, boolean>>({});
  const [optOutLoading, setOptOutLoading] = useState(false);
  const [optOutError, setOptOutError] = useState<string | null>(null);

  // --- Customer state ---
  const [customerFile, setCustomerFile] = useState<ParsedFile | null>(null);
  const [customerSheetName, setCustomerSheetName] = useState<string | null>(null);
  const [customerRoles, setCustomerRoles] = useState<RolesMap>({});
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [result, setResult] = useState<ScrubResult | null>(null);
  const [canonicalOutput, setCanonicalOutput] = useState<CanonicalOutput | null>(null);

  async function handleOptOutFiles(files: File[]) {
    setOptOutLoading(true);
    setOptOutError(null);
    try {
      const parsed = await Promise.all(files.map(parseUploadedFile));
      setOptOutFiles((prev) => [...prev, ...parsed]);
      setOptOutRoles((prev) => {
        const next = { ...prev };
        for (const file of parsed) {
          for (const sheet of file.sheets) {
            next[sheetKey(file.id, sheet.name)] = rolesFromDetection(sheet.headers);
          }
        }
        return next;
      });
      setOptOutIncluded((prev) => {
        const next = { ...prev };
        for (const file of parsed) {
          const singleSheet = file.sheets.length === 1;
          for (const sheet of file.sheets) {
            next[sheetKey(file.id, sheet.name)] =
              singleSheet || OPT_OUT_SHEET_NAME_PATTERN.test(sheet.name);
          }
        }
        return next;
      });
    } catch (e) {
      setOptOutError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setOptOutLoading(false);
    }
  }

  function handleOptOutRoleChange(key: string, colIndex: number, role: ColumnRole) {
    setOptOutRoles((prev) => {
      const sheetRoles = { ...(prev[key] ?? {}) };
      if (role === "countrycode") {
        for (const k of Object.keys(sheetRoles)) {
          if (sheetRoles[Number(k)] === "countrycode") delete sheetRoles[Number(k)];
        }
      }
      sheetRoles[colIndex] = role;
      return { ...prev, [key]: sheetRoles };
    });
  }

  function handleOptOutIncludedChange(key: string, included: boolean) {
    setOptOutIncluded((prev) => ({ ...prev, [key]: included }));
  }

  function handleRemoveOptOutFile(fileId: string) {
    setOptOutFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  const optOutSources = useMemo(() => {
    const sources: { config: OptOutSheetConfig; sheet: ParsedSheet; fileName: string }[] = [];
    for (const file of optOutFiles) {
      for (const sheet of file.sheets) {
        const key = sheetKey(file.id, sheet.name);
        if (!optOutIncluded[key]) continue;
        const { phoneColIndexes, countryCodeColIndex } = rolesToConfig(optOutRoles[key] ?? {});
        sources.push({
          fileName: file.fileName,
          sheet,
          config: {
            fileId: file.id,
            fileName: file.fileName,
            sheetName: sheet.name,
            included: true,
            phoneColIndexes,
            countryCodeColIndex,
          },
        });
      }
    }
    return sources;
  }, [optOutFiles, optOutIncluded, optOutRoles]);

  const canContinueFromOptOut =
    optOutSources.length > 0 && optOutSources.every((s) => s.config.phoneColIndexes.length > 0);

  async function handleCustomerFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const parsed = await parseUploadedFile(file);
      const withData = parsed.sheets.filter((s) => s.headers.length > 0);
      const chosen = (withData.length > 0 ? withData : parsed.sheets).reduce((best, s) =>
        s.rows.length > best.rows.length ? s : best,
      );
      setCustomerFile(parsed);
      setCustomerSheetName(chosen.name);
      setCustomerRoles(rolesFromDetection(chosen.headers));
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setCustomerLoading(false);
    }
  }

  function handleCustomerSheetChange(name: string) {
    setCustomerSheetName(name);
    const sheet = customerFile?.sheets.find((s) => s.name === name);
    setCustomerRoles(rolesFromDetection(sheet?.headers ?? []));
  }

  function handleCustomerRoleChange(colIndex: number, role: ColumnRole) {
    setCustomerRoles((prev) => {
      const next = { ...prev };
      if (role === "countrycode" || role === "name") {
        for (const k of Object.keys(next)) {
          if (next[Number(k)] === role) delete next[Number(k)];
        }
      }
      next[colIndex] = role;
      return next;
    });
  }

  const customerSheet = customerFile?.sheets.find((s) => s.name === customerSheetName) ?? null;
  const customerConfig: CustomerSheetConfig = useMemo(() => {
    const { phoneColIndexes, countryCodeColIndex, nameColIndex } = rolesToConfig(customerRoles);
    return { phoneColIndexes, countryCodeColIndex, nameColIndex };
  }, [customerRoles]);

  const canRun = !!customerSheet && customerConfig.phoneColIndexes.length > 0;

  const STEPS = cleaningType === "optout" ? STEPS_OPTOUT : STEPS_BASIC;
  const optOutStepIndex = 1;
  const customerStepIndex = cleaningType === "optout" ? 2 : 1;
  const summaryStepIndex = cleaningType === "optout" ? 3 : 2;

  function runScrub() {
    if (!customerSheet) return;
    const optOutSet =
      cleaningType === "optout" ? buildOptOutSet(optOutSources, defaultCountryCode) : new Set<string>();
    const scrubResult = scrubCustomerSheet(customerSheet, customerConfig, optOutSet, defaultCountryCode);
    setResult(scrubResult);
    setCanonicalOutput(
      buildCanonicalOutput(customerSheet, customerConfig, scrubResult.keptRows, defaultCountryCode),
    );
    setStep(summaryStepIndex);
  }

  function restart() {
    setCleaningType(null);
    setOptOutFiles([]);
    setOptOutRoles({});
    setOptOutIncluded({});
    setCustomerFile(null);
    setCustomerSheetName(null);
    setCustomerRoles({});
    setResult(null);
    setCanonicalOutput(null);
    setStep(0);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Logo />
        </div>
        <div className="h-[3px] bg-gradient-to-r from-brand-green via-brand-mint to-brand-orange" />
      </header>

      <div className="dot-grid relative overflow-hidden bg-brand-navy pt-14 pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -left-24 h-80 w-80 rounded-full bg-brand-green/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-16 -right-20 h-72 w-72 rounded-full bg-brand-mint/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-navy to-transparent"
        />
        <div className="relative mx-auto w-full max-w-4xl px-6">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {cleaningType === "optout" ? (
              <>
                Opt-out list, <span className="text-brand-mint">scrubbed</span>.
              </>
            ) : (
              <>
                Broadcast-ready contacts, <span className="text-brand-mint">fast</span>.
              </>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-base text-brand-mint/80 sm:text-lg">
            👉 No manual cross-checking. No guesswork.{" "}
            <span className="font-semibold text-white">Compliant contact lists that work.</span>
          </p>
          <div className="mt-10">
            <StepIndicator steps={STEPS} currentIndex={step} />
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-16 w-full max-w-4xl flex-1 px-6 pb-16">
        <div className="animate-fade-up rounded-3xl border border-zinc-100 bg-white p-6 shadow-2xl shadow-zinc-900/10 sm:p-8">
          {step === 0 && (
            <CleaningTypeStep
              stepNumber={1}
              onSelect={(type) => {
                setCleaningType(type);
                setStep(type === "optout" ? optOutStepIndex : customerStepIndex);
              }}
            />
          )}

          {cleaningType === "optout" && step === optOutStepIndex && (
            <OptOutStep
              stepNumber={2}
              files={optOutFiles}
              roles={optOutRoles}
              included={optOutIncluded}
              defaultCountryCode={defaultCountryCode}
              onDefaultCountryCodeChange={setDefaultCountryCode}
              onFiles={handleOptOutFiles}
              onRoleChange={handleOptOutRoleChange}
              onIncludedChange={handleOptOutIncludedChange}
              onRemoveFile={handleRemoveOptOutFile}
              onBack={() => setStep(0)}
              onContinue={() => setStep(customerStepIndex)}
              canContinue={canContinueFromOptOut}
              loading={optOutLoading}
              error={optOutError}
            />
          )}

          {cleaningType && step === customerStepIndex && (
            <CustomerStep
              stepNumber={cleaningType === "optout" ? 3 : 2}
              showOptOutCopy={cleaningType === "optout"}
              file={customerFile}
              selectedSheetName={customerSheetName}
              roles={customerRoles}
              onFile={handleCustomerFile}
              onSheetChange={handleCustomerSheetChange}
              onRoleChange={handleCustomerRoleChange}
              onBack={() => setStep(cleaningType === "optout" ? optOutStepIndex : 0)}
              onRun={runScrub}
              canRun={canRun}
              loading={customerLoading}
              error={customerError}
            />
          )}

          {cleaningType &&
            step === summaryStepIndex &&
            result &&
            canonicalOutput &&
            customerFile &&
            customerSheetName && (
              <ResultsStep
                stepNumber={cleaningType === "optout" ? 4 : 3}
                cleaningType={cleaningType}
                result={result}
                canonicalOutput={canonicalOutput}
                customerFile={customerFile}
                customerSheetName={customerSheetName}
                onBack={() => setStep(customerStepIndex)}
                onRestart={restart}
              />
            )}
        </div>
        <p className="mt-6 text-center text-xs text-zinc-400">
          Files are processed entirely in your browser — nothing is uploaded to a server.
        </p>
      </main>

      <footer className="border-t border-white/5 bg-brand-navy py-14">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 text-center">
          <Logo variant="light" />
          <div className="mt-2 space-y-1.5 text-sm text-zinc-300">
            <p>
              📍 Block E, 2nd Floor Clearwater Corporate Office Park, North Cnr Atlas Rd,
              Merlin Dr, Parkhaven, Boksburg, 1459
            </p>
            <p>📞 +27 10 446 5788</p>
            <p>✉️ info@themessengernetwork.co.za</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

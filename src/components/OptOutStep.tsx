"use client";

import Dropzone from "./Dropzone";
import ColumnMapper, { ColumnRole } from "./ColumnMapper";
import Button from "./Button";
import type { ParsedFile } from "@/lib/types";
import { OPT_OUT_SHEET_NAME_PATTERN } from "@/lib/columnDetect";

export function sheetKey(fileId: string, sheetName: string) {
  return `${fileId}::${sheetName}`;
}

interface OptOutStepProps {
  files: ParsedFile[];
  roles: Record<string, Record<number, ColumnRole>>;
  included: Record<string, boolean>;
  defaultCountryCode: string;
  onDefaultCountryCodeChange: (value: string) => void;
  onFiles: (files: File[]) => void;
  onRoleChange: (key: string, colIndex: number, role: ColumnRole) => void;
  onIncludedChange: (key: string, included: boolean) => void;
  onRemoveFile: (fileId: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  loading: boolean;
  error: string | null;
}

export default function OptOutStep({
  files,
  roles,
  included,
  defaultCountryCode,
  onDefaultCountryCodeChange,
  onFiles,
  onRoleChange,
  onIncludedChange,
  onRemoveFile,
  onContinue,
  canContinue,
  loading,
  error,
}: OptOutStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          1. Upload your opt-out / do-not-contact list
        </h2>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          One or more spreadsheets or CSVs of people who must not be contacted. A single
          file can have multiple sheets (e.g. &ldquo;Opt Out&rdquo;, &ldquo;RSVP&rdquo;,
          &ldquo;Unsubscribed&rdquo;) — pick which ones count below.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60">
        <label htmlFor="cc" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Default country dial code
        </label>
        <input
          id="cc"
          type="text"
          inputMode="numeric"
          className="w-20 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-center text-sm font-semibold focus:ring-2 focus:ring-brand-green/50 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
          value={defaultCountryCode}
          onChange={(e) => onDefaultCountryCodeChange(e.target.value.replace(/\D/g, ""))}
        />
        <span className="text-xs text-zinc-400">
          Applied when a number starts with a leading 0 (South Africa = 27)
        </span>
      </div>

      <Dropzone
        label="Drop opt-out file(s) here"
        helpText="You can add more than one file — they'll all be merged into one opt-out set."
        multiple
        onFiles={onFiles}
        disabled={loading}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {files.map((file) => (
        <div
          key={file.id}
          className="animate-fade-up rounded-2xl border border-zinc-100 p-4 shadow-sm dark:border-zinc-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">{file.fileName}</h3>
            <Button variant="danger" className="px-3 py-1 text-xs" onClick={() => onRemoveFile(file.id)}>
              Remove file
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-4">
            {file.sheets.map((sheet) => {
              const key = sheetKey(file.id, sheet.name);
              const isIncluded = included[key] ?? false;
              const looksLikeOptOut = OPT_OUT_SHEET_NAME_PATTERN.test(sheet.name);
              return (
                <div
                  key={key}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-green"
                      checked={isIncluded}
                      onChange={(e) => onIncludedChange(key, e.target.checked)}
                    />
                    Sheet: {sheet.name}
                    {looksLikeOptOut && (
                      <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                        looks like an opt-out sheet
                      </span>
                    )}
                    <span className="ml-auto text-xs font-normal text-zinc-400">
                      {sheet.rows.length} rows
                    </span>
                  </label>

                  {isIncluded && (
                    <div className="mt-3">
                      {sheet.headers.length === 0 ? (
                        <p className="text-sm text-zinc-400">This sheet appears to be empty.</p>
                      ) : (
                        <ColumnMapper
                          headers={sheet.headers}
                          sampleRow={sheet.rows[0]}
                          roles={roles[key] ?? {}}
                          onChange={(colIndex, role) => onRoleChange(key, colIndex, role)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button disabled={!canContinue || loading} onClick={onContinue}>
          Continue to customer database →
        </Button>
      </div>
    </div>
  );
}

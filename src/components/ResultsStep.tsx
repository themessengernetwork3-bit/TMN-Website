"use client";

import { useState } from "react";
import type { ParsedFile, ScrubResult } from "@/lib/types";
import type { CanonicalOutput } from "@/lib/canonicalOutput";
import {
  buildCsvBlob,
  buildRemovedContactsCsvBlob,
  buildXlsxBlob,
  cleanedFileName,
  downloadBlob,
} from "@/lib/exportFile";

interface ResultsStepProps {
  result: ScrubResult;
  canonicalOutput: CanonicalOutput;
  customerFile: ParsedFile;
  customerSheetName: string;
  onBack: () => void;
  onRestart: () => void;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default function ResultsStep({
  result,
  canonicalOutput,
  customerFile,
  customerSheetName,
  onBack,
  onRestart,
}: ResultsStepProps) {
  const [showRemoved, setShowRemoved] = useState(false);
  const { summary } = result;

  function downloadCleaned() {
    const name = cleanedFileName(customerFile.fileName);
    if (customerFile.format === "csv") {
      const blob = buildCsvBlob(
        canonicalOutput.headers,
        canonicalOutput.rows,
        customerFile.delimiter || ",",
      );
      downloadBlob(blob, name);
    } else {
      const blob = buildXlsxBlob(
        customerFile.workbook,
        customerSheetName,
        canonicalOutput.headers,
        canonicalOutput.rows,
      );
      downloadBlob(blob, name);
    }
  }

  function downloadRemovedContacts() {
    const base = customerFile.fileName.replace(/\.[^.]+$/, "");
    const blob = buildRemovedContactsCsvBlob(result.removedContacts);
    downloadBlob(blob, `${base}_removed_contacts.csv`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">3. Summary</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Assumed default country code <strong>+{summary.defaultCountryCode}</strong> for
          any number with a leading 0.
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Cleaned file is exported as{" "}
          <strong>Name, CountryCode, Phone, ContactStatus, AllowCampaign, AllowSMS</strong>.
          {!canonicalOutput.foundInSource.contactStatus && (
            <> No ContactStatus column found in the source — defaulted to &ldquo;VALID&rdquo;.</>
          )}
          {!canonicalOutput.foundInSource.allowCampaign && (
            <> No AllowCampaign column found — left blank.</>
          )}
          {!canonicalOutput.foundInSource.allowSms && (
            <> No AllowSMS column found — left blank.</>
          )}
        </p>
      </div>

      {!summary.consistent && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <strong>Discrepancy detected:</strong> original rows ({summary.totalOriginalRows})
          does not equal removed ({summary.rowsRemoved}) + remaining ({summary.rowsRemaining}).
          Please re-check your column selections before using this file.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Rows in original file" value={summary.totalOriginalRows} />
        <StatCard label="Unique opt-out numbers" value={summary.totalUniqueOptOutNumbers} />
        <StatCard label="Unique contacts removed" value={summary.uniqueMatchedContactsRemoved} />
        <StatCard label="Rows removed" value={summary.rowsRemoved} />
        <StatCard label="Rows remaining" value={summary.rowsRemaining} />
      </div>

      {summary.rowsRemoved !== summary.uniqueMatchedContactsRemoved && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Rows removed ({summary.rowsRemoved}) differ from unique contacts removed (
          {summary.uniqueMatchedContactsRemoved}) — the customer file had duplicate rows
          sharing the same phone number, and every duplicate was removed.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadCleaned}
          disabled={!summary.consistent}
          className="rounded-full bg-brand-green px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-green-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download cleaned file
        </button>
        <button
          type="button"
          onClick={downloadRemovedContacts}
          disabled={result.removedContacts.length === 0}
          className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Download removed-contacts list
        </button>
        <button
          type="button"
          onClick={() => setShowRemoved((v) => !v)}
          className="rounded-full border border-transparent px-6 py-2 text-sm font-medium text-brand-green hover:underline"
        >
          {showRemoved ? "Hide" : "Preview"} removed contacts ({result.removedContacts.length})
        </button>
      </div>

      {showRemoved && (
        <div className="max-h-80 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300">
                  Matched phone
                </th>
              </tr>
            </thead>
            <tbody>
              {result.removedContacts.map((c, i) => (
                <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2">{c.name || <span className="text-zinc-400 italic">—</span>}</td>
                  <td className="px-3 py-2 font-mono">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          ← Adjust columns
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Start a new scrub
        </button>
      </div>
    </div>
  );
}

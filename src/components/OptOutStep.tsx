"use client";

import Dropzone from "./Dropzone";
import ColumnMapper, { ColumnRole } from "./ColumnMapper";
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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          1. Upload your opt-out / do-not-contact list
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          One or more spreadsheets or CSVs of people who must not be contacted. A single
          file can have multiple sheets (e.g. &ldquo;Opt Out&rdquo;, &ldquo;RSVP&rdquo;,
          &ldquo;Unsubscribed&rdquo;) — pick which ones count below.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="cc" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Default country dial code
        </label>
        <input
          id="cc"
          type="text"
          inputMode="numeric"
          className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {files.map((file) => (
        <div
          key={file.id}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{file.fileName}</h3>
            <button
              type="button"
              onClick={() => onRemoveFile(file.id)}
              className="text-xs text-red-600 hover:underline dark:text-red-400"
            >
              Remove file
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-4">
            {file.sheets.map((sheet) => {
              const key = sheetKey(file.id, sheet.name);
              const isIncluded = included[key] ?? false;
              const looksLikeOptOut = OPT_OUT_SHEET_NAME_PATTERN.test(sheet.name);
              return (
                <div
                  key={key}
                  className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={(e) => onIncludedChange(key, e.target.checked)}
                    />
                    Sheet: {sheet.name}
                    {looksLikeOptOut && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-normal text-teal-800 dark:bg-teal-900 dark:text-teal-200">
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
        <button
          type="button"
          disabled={!canContinue || loading}
          onClick={onContinue}
          className="rounded-full bg-teal-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to customer database →
        </button>
      </div>
    </div>
  );
}

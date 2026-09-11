"use client";

import Dropzone from "./Dropzone";
import ColumnMapper, { ColumnRole } from "./ColumnMapper";
import type { ParsedFile } from "@/lib/types";

interface CustomerStepProps {
  file: ParsedFile | null;
  selectedSheetName: string | null;
  roles: Record<number, ColumnRole>;
  onFile: (files: File[]) => void;
  onSheetChange: (name: string) => void;
  onRoleChange: (colIndex: number, role: ColumnRole) => void;
  onBack: () => void;
  onRun: () => void;
  canRun: boolean;
  loading: boolean;
  error: string | null;
}

export default function CustomerStep({
  file,
  selectedSheetName,
  roles,
  onFile,
  onSheetChange,
  onRoleChange,
  onBack,
  onRun,
  canRun,
  loading,
  error,
}: CustomerStepProps) {
  const sheet = file?.sheets.find((s) => s.name === selectedSheetName) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          2. Upload the customer database to clean
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          This is the contact list that needs opt-outs removed before use. Nothing here
          is modified in your opt-out file — it&rsquo;s read-only reference data.
        </p>
      </div>

      <Dropzone
        label={file ? `Replace "${file.fileName}"` : "Drop the customer database here"}
        helpText="A single spreadsheet or CSV. If it has multiple sheets, you'll pick which one below."
        onFiles={onFile}
        disabled={loading}
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {file && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{file.fileName}</h3>
            {file.sheets.length > 1 && (
              <label className="flex items-center gap-2 text-sm">
                Sheet:
                <select
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={selectedSheetName ?? ""}
                  onChange={(e) => onSheetChange(e.target.value)}
                >
                  {file.sheets.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.rows.length} rows)
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {sheet && (
            <div className="mt-3">
              <p className="mb-2 text-xs text-zinc-400">{sheet.rows.length} rows</p>
              {sheet.headers.length === 0 ? (
                <p className="text-sm text-zinc-400">This sheet appears to be empty.</p>
              ) : (
                <ColumnMapper
                  headers={sheet.headers}
                  sampleRow={sheet.rows[0]}
                  roles={roles}
                  onChange={onRoleChange}
                  allowName
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!canRun || loading}
          onClick={onRun}
          className="rounded-full bg-teal-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Run scrub →
        </button>
      </div>
    </div>
  );
}

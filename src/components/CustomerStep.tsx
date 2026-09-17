"use client";

import Dropzone from "./Dropzone";
import ColumnMapper, { ColumnRole } from "./ColumnMapper";
import Button from "./Button";
import type { ParsedFile } from "@/lib/types";

interface CustomerStepProps {
  stepNumber: number;
  showOptOutCopy: boolean;
  file: ParsedFile | null;
  selectedSheetName: string | null;
  roles: Record<number, ColumnRole>;
  extraColumns: { index: number; header: string; fieldName: string }[];
  extraColumnsSelected: Record<number, boolean>;
  onFile: (files: File[]) => void;
  onSheetChange: (name: string) => void;
  onRoleChange: (colIndex: number, role: ColumnRole) => void;
  onExtraColumnToggle: (colIndex: number, included: boolean) => void;
  onBack: () => void;
  onRun: () => void;
  canRun: boolean;
  loading: boolean;
  error: string | null;
}

export default function CustomerStep({
  stepNumber,
  showOptOutCopy,
  file,
  selectedSheetName,
  roles,
  extraColumns,
  extraColumnsSelected,
  onFile,
  onSheetChange,
  onRoleChange,
  onExtraColumnToggle,
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
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          {stepNumber}. Upload the customer database to clean
        </h2>
        <p className="mt-2 text-base text-zinc-500">
          {showOptOutCopy
            ? "This is the contact list that needs opt-outs removed before use. Nothing here is modified in your opt-out file — it’s read-only reference data."
            : "This is the contact list to format and dedupe for your broadcast."}
        </p>
      </div>

      <Dropzone
        label={
          file
            ? `Replace "${file.fileName}"`
            : "Drop the customer database here"
        }
        helpText="A single spreadsheet or CSV. If it has multiple sheets, you'll pick which one below."
        onFiles={onFile}
        disabled={loading}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {file && (
        <div className="animate-fade-up rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-zinc-800">{file.fileName}</h3>
            {file.sheets.length > 1 && (
              <label className="flex items-center gap-2 text-sm">
                Sheet:
                <select
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-brand-green/50 focus:outline-none"
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
              <p className="mb-2 text-xs text-zinc-400">
                {sheet.rows.length} rows
              </p>
              {sheet.headers.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  This sheet appears to be empty.
                </p>
              ) : (
                <ColumnMapper
                  headers={sheet.headers}
                  sampleRow={sheet.rows[0]}
                  roles={roles}
                  onChange={onRoleChange}
                  allowName
                />
              )}

              {extraColumns.length > 0 && (
                <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5">
                  <p className="text-sm font-semibold text-zinc-800">
                    Additional columns found in your file
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    These aren&rsquo;t part of the standard Name / CountryCode / Phone /
                    ContactStatus / AllowCampaign / AllowSMS fields. Tick any you want carried
                    into the cleaned file — everything else is left out. Multi-word column names
                    are exported with underscores instead of spaces (e.g. &ldquo;Email
                    address&rdquo; → &ldquo;Email_address&rdquo;).
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {extraColumns.map(({ index, header, fieldName }) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 text-sm text-zinc-700"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-brand-green"
                          checked={extraColumnsSelected[index] ?? false}
                          onChange={(e) => onExtraColumnToggle(index, e.target.checked)}
                        />
                        {header || (
                          <span className="text-zinc-400 italic">
                            (unnamed column {index + 1})
                          </span>
                        )}
                        {fieldName !== header && (
                          <span className="text-xs text-zinc-400">
                            → exports as <span className="font-mono">{fieldName}</span>
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button disabled={!canRun || loading} onClick={onRun}>
          Run scrub →
        </Button>
      </div>
    </div>
  );
}

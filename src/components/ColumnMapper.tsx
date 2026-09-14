"use client";

export type ColumnRole = "ignore" | "phone" | "countrycode" | "name";

interface ColumnMapperProps {
  headers: string[];
  sampleRow?: string[];
  roles: Record<number, ColumnRole>;
  onChange: (colIndex: number, role: ColumnRole) => void;
  allowName?: boolean;
}

const ROLE_LABELS: Record<ColumnRole, string> = {
  ignore: "Ignore",
  phone: "Phone number",
  countrycode: "Country / dial code",
  name: "Contact name",
};

const ROLE_STYLES: Record<ColumnRole, string> = {
  ignore: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  phone: "bg-brand-green/10 text-brand-green",
  countrycode: "bg-brand-orange/10 text-brand-orange",
  name: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
};

export default function ColumnMapper({
  headers,
  sampleRow,
  roles,
  onChange,
  allowName = false,
}: ColumnMapperProps) {
  const roleOptions: ColumnRole[] = allowName
    ? ["ignore", "phone", "countrycode", "name"]
    : ["ignore", "phone", "countrycode"];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800">
      <div className="hidden grid-cols-[1fr_1fr_auto] gap-3 bg-zinc-50 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase sm:grid dark:bg-zinc-900">
        <span>Column</span>
        <span>Sample value</span>
        <span>Role</span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {headers.map((header, i) => {
          const role = roles[i] ?? "ignore";
          return (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-zinc-50/80 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-3 dark:hover:bg-zinc-900/50"
            >
              <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {header || <span className="text-zinc-400 italic">(unnamed column {i + 1})</span>}
              </span>
              <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                {sampleRow?.[i] || <span className="text-zinc-400 italic">—</span>}
              </span>
              <select
                className={`w-fit min-w-[9rem] rounded-full border-0 px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-brand-green/50 focus:outline-none ${ROLE_STYLES[role]}`}
                value={role}
                onChange={(e) => onChange(i, e.target.value as ColumnRole)}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

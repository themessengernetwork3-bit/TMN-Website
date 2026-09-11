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
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300">
              Column
            </th>
            <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300">
              Sample value
            </th>
            <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, i) => (
            <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-3 py-2 font-medium text-zinc-800 dark:text-zinc-100">
                {header || <span className="text-zinc-400 italic">(unnamed column {i + 1})</span>}
              </td>
              <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 truncate max-w-[16rem]">
                {sampleRow?.[i] || <span className="italic text-zinc-400">—</span>}
              </td>
              <td className="px-3 py-2">
                <select
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={roles[i] ?? "ignore"}
                  onChange={(e) => onChange(i, e.target.value as ColumnRole)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

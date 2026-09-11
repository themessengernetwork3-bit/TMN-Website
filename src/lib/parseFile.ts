import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { FileFormat, ParsedFile, ParsedSheet } from "./types";

function detectFormat(fileName: string): FileFormat {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "xlsx" || ext === "xlsm") return "xlsx";
  if (ext === "xls") return "xls";
  return "csv";
}

/** Drops fully-empty rows (e.g. trailing blank lines) that carry no data at all. */
function isBlankRow(row: string[]): boolean {
  return row.every((cell) => cell === undefined || cell === null || cell === "");
}

async function parseCsvFile(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: "greedy",
  });

  const rawRows = result.data.filter((row) => !isBlankRow(row));
  const headers = (rawRows[0] ?? []).map((h) => String(h ?? "").trim());
  const rows = rawRows.slice(1).map((row) =>
    headers.map((_, i) => String(row[i] ?? "")),
  );

  const sheet: ParsedSheet = { name: "Sheet1", headers, rows };

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    format: "csv",
    delimiter: result.meta.delimiter || ",",
    sheets: [sheet],
  };
}

async function parseExcelFile(file: File, format: FileFormat): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });

  const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json<string[]>(ws, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    });
    const rawRows = aoa.filter((row) => !isBlankRow(row));
    const headers = (rawRows[0] ?? []).map((h) => String(h ?? "").trim());
    const rows = rawRows
      .slice(1)
      .map((row) => headers.map((_, i) => String(row[i] ?? "")));
    return { name, headers, rows };
  });

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    format,
    sheets,
    workbook,
  };
}

export async function parseUploadedFile(file: File): Promise<ParsedFile> {
  const format = detectFormat(file.name);
  if (format === "csv") return parseCsvFile(file);
  return parseExcelFile(file, format);
}

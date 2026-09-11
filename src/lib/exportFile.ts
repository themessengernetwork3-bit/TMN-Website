import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { FileFormat, RemovedContact } from "./types";

export function buildCsvBlob(
  headers: string[],
  rows: string[][],
  delimiter: string,
): Blob {
  const content = Papa.unparse([headers, ...rows], { delimiter });
  return new Blob([content], { type: "text/csv;charset=utf-8;" });
}

export function buildXlsxBlob(
  sourceWorkbook: unknown,
  sheetName: string,
  headers: string[],
  rows: string[][],
): Blob {
  const workbook = sourceWorkbook as XLSX.WorkBook;
  const clonedSheets: XLSX.WorkBook["Sheets"] = { ...workbook.Sheets };
  clonedSheets[sheetName] = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const cloned: XLSX.WorkBook = {
    ...workbook,
    Sheets: clonedSheets,
    SheetNames: [...workbook.SheetNames],
  };
  const out = XLSX.write(cloned, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function buildRemovedContactsCsvBlob(contacts: RemovedContact[]): Blob {
  const content = Papa.unparse(
    [["Name", "Phone"], ...contacts.map((c) => [c.name, c.phone])],
    { delimiter: "," },
  );
  return new Blob([content], { type: "text/csv;charset=utf-8;" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function cleanedFileName(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  if (dot === -1) return `${originalName}_cleaned`;
  return `${originalName.slice(0, dot)}_cleaned${originalName.slice(dot)}`;
}

export function formatForExtension(format: FileFormat): string {
  return format === "csv" ? "csv" : "xlsx";
}

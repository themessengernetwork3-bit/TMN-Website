export type FileFormat = "csv" | "xlsx" | "xls";

export interface ParsedSheet {
  /** Sheet/tab name. CSV files get a single synthetic sheet named "Sheet1". */
  name: string;
  headers: string[];
  /** Data rows, excluding the header row. Each row is aligned to `headers`. */
  rows: string[][];
}

export interface ParsedFile {
  id: string;
  fileName: string;
  format: FileFormat;
  /** CSV/TSV only — the delimiter detected in the source file, preserved on export. */
  delimiter?: string;
  sheets: ParsedSheet[];
  /**
   * For xlsx/xls files: the original workbook, kept so we can export the
   * cleaned data back into the same workbook (preserving any other sheets)
   * rather than starting from scratch.
   */
  workbook?: unknown;
}

export interface ColumnDetection {
  /** Indexes into `headers` that look like phone number columns. */
  phoneCandidates: number[];
  /** Index of a likely separate country/dial code column, if any. */
  countryCodeCandidate: number | null;
  /** Index of a likely contact-name column, if any. */
  nameCandidate: number | null;
}

export interface OptOutSheetConfig {
  fileId: string;
  fileName: string;
  sheetName: string;
  included: boolean;
  phoneColIndexes: number[];
  countryCodeColIndex: number | null;
}

export interface CustomerSheetConfig {
  phoneColIndexes: number[];
  countryCodeColIndex: number | null;
  nameColIndex: number | null;
}

export interface ScrubSummary {
  totalOriginalRows: number;
  totalUniqueOptOutNumbers: number;
  uniqueMatchedContactsRemoved: number;
  rowsRemoved: number;
  rowsRemaining: number;
  consistent: boolean;
  defaultCountryCode: string;
}

export interface RemovedContact {
  name: string;
  phone: string;
}

export interface ScrubResult {
  headers: string[];
  keptRows: string[][];
  removedRows: string[][];
  removedContacts: RemovedContact[];
  summary: ScrubSummary;
}

import { isValidPhoneNumber, normalizePhoneNumber } from "./normalize";
import type {
  CustomerSheetConfig,
  OptOutSheetConfig,
  ParsedSheet,
  RemovedContact,
  ScrubResult,
} from "./types";

interface OptOutSource {
  config: OptOutSheetConfig;
  sheet: ParsedSheet;
}

/** Builds the deduplicated set of normalized opt-out numbers from every selected sheet. */
export function buildOptOutSet(
  sources: OptOutSource[],
  defaultCountryCode: string,
): Set<string> {
  const set = new Set<string>();
  for (const { config, sheet } of sources) {
    if (!config.included) continue;
    for (const row of sheet.rows) {
      for (const colIndex of config.phoneColIndexes) {
        const raw = row[colIndex];
        const explicitCc =
          config.countryCodeColIndex !== null ? row[config.countryCodeColIndex] : null;
        const normalized = normalizePhoneNumber(raw, defaultCountryCode, explicitCc);
        if (normalized) set.add(normalized);
      }
    }
  }
  return set;
}

/**
 * Removes rows with no valid phone number, dedupes the rest by normalized
 * phone number (keeping the first occurrence of each), then removes anyone
 * whose number is in `optOutSet` (pass an empty set for basic cleaning,
 * where there is no opt-out list).
 */
export function scrubCustomerSheet(
  sheet: ParsedSheet,
  config: CustomerSheetConfig,
  optOutSet: Set<string>,
  defaultCountryCode: string,
): ScrubResult {
  const keptRows: string[][] = [];
  const removedRows: string[][] = [];
  const removedContacts: RemovedContact[] = [];
  const matchedOptOutNumbers = new Set<string>();
  const seenNumbers = new Set<string>();
  let invalidRowsRemoved = 0;
  let duplicateRowsRemoved = 0;
  let optOutRowsRemoved = 0;

  for (const row of sheet.rows) {
    const explicitCc =
      config.countryCodeColIndex !== null ? row[config.countryCodeColIndex] : null;

    const rowNumbers = config.phoneColIndexes
      .map((colIndex) => normalizePhoneNumber(row[colIndex], defaultCountryCode, explicitCc))
      .filter((n): n is string => n !== null);

    const name = config.nameColIndex !== null ? (row[config.nameColIndex] ?? "") : "";

    const validNumbers = config.phoneColIndexes
      .filter((colIndex) => isValidPhoneNumber(row[colIndex], defaultCountryCode, explicitCc))
      .map((colIndex) => normalizePhoneNumber(row[colIndex], defaultCountryCode, explicitCc))
      .filter((n): n is string => n !== null);
    if (validNumbers.length === 0) {
      invalidRowsRemoved++;
      removedRows.push(row);
      removedContacts.push({ name, phone: rowNumbers[0] ?? "", reason: "invalid" });
      continue;
    }

    const isDuplicate = validNumbers.some((n) => seenNumbers.has(n));
    if (isDuplicate) {
      duplicateRowsRemoved++;
      removedRows.push(row);
      removedContacts.push({ name, phone: validNumbers[0], reason: "duplicate" });
      continue;
    }
    validNumbers.forEach((n) => seenNumbers.add(n));

    const matches = validNumbers.filter((n) => optOutSet.has(n));

    if (matches.length > 0) {
      matches.forEach((n) => matchedOptOutNumbers.add(n));
      optOutRowsRemoved++;
      removedRows.push(row);
      removedContacts.push({ name, phone: matches[0], reason: "opt-out" });
    } else {
      keptRows.push(row);
    }
  }

  const totalOriginalRows = sheet.rows.length;
  const rowsRemoved = removedRows.length;
  const rowsRemaining = keptRows.length;

  return {
    headers: sheet.headers,
    keptRows,
    removedRows,
    removedContacts,
    summary: {
      totalOriginalRows,
      totalUniqueOptOutNumbers: optOutSet.size,
      uniqueMatchedContactsRemoved: matchedOptOutNumbers.size,
      duplicateRowsRemoved,
      optOutRowsRemoved,
      invalidRowsRemoved,
      rowsRemoved,
      rowsRemaining,
      consistent: totalOriginalRows === rowsRemoved + rowsRemaining,
      defaultCountryCode,
    },
  };
}

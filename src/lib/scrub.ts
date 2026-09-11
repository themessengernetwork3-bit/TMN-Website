import { normalizePhoneNumber } from "./normalize";
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

  for (const row of sheet.rows) {
    const explicitCc =
      config.countryCodeColIndex !== null ? row[config.countryCodeColIndex] : null;

    const rowNumbers = config.phoneColIndexes
      .map((colIndex) => normalizePhoneNumber(row[colIndex], defaultCountryCode, explicitCc))
      .filter((n): n is string => n !== null);

    const matches = rowNumbers.filter((n) => optOutSet.has(n));

    if (matches.length > 0) {
      matches.forEach((n) => matchedOptOutNumbers.add(n));
      removedRows.push(row);
      removedContacts.push({
        name: config.nameColIndex !== null ? row[config.nameColIndex] ?? "" : "",
        phone: matches[0],
      });
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
      rowsRemoved,
      rowsRemaining,
      consistent: totalOriginalRows === rowsRemoved + rowsRemaining,
      defaultCountryCode,
    },
  };
}

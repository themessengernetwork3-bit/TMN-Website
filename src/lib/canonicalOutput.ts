import { splitPhoneNumber } from "./normalize";
import { detectPassthroughColumns } from "./columnDetect";
import type { CustomerSheetConfig, ParsedSheet } from "./types";

export const CANONICAL_HEADERS = [
  "Name",
  "CountryCode",
  "Phone",
  "ContactStatus",
  "AllowCampaign",
  "AllowSMS",
] as const;

export interface CanonicalOutput {
  headers: string[];
  rows: string[][];
  /** Which passthrough fields were actually found in the source file, for the summary note. */
  foundInSource: {
    contactStatus: boolean;
    allowCampaign: boolean;
    allowSms: boolean;
  };
}

const DEFAULT_CONTACT_STATUS = "VALID";

/**
 * Builds the standardized Name/CountryCode/Phone/ContactStatus/AllowCampaign/AllowSMS
 * output, regardless of what columns the source customer file actually had.
 * ContactStatus/AllowCampaign/AllowSMS are carried through verbatim when the source
 * has matching columns; ContactStatus otherwise defaults to "VALID" (these are the
 * contacts that passed the scrub) and AllowCampaign/AllowSMS default to blank rather
 * than assuming consent.
 */
export function buildCanonicalOutput(
  sheet: ParsedSheet,
  config: CustomerSheetConfig,
  rows: string[][],
  defaultCountryCode: string,
): CanonicalOutput {
  const passthrough = detectPassthroughColumns(sheet.headers);
  const primaryPhoneCol = config.phoneColIndexes[0] ?? null;

  const outRows = rows.map((row) => {
    const name = config.nameColIndex !== null ? (row[config.nameColIndex] ?? "") : "";

    const explicitCc =
      config.countryCodeColIndex !== null ? row[config.countryCodeColIndex] : null;
    const phoneRaw = primaryPhoneCol !== null ? row[primaryPhoneCol] : null;
    const parts = splitPhoneNumber(phoneRaw, defaultCountryCode, explicitCc);

    const contactStatus =
      passthrough.contactStatusIndex !== null
        ? (row[passthrough.contactStatusIndex] ?? "")
        : DEFAULT_CONTACT_STATUS;
    const allowCampaign =
      passthrough.allowCampaignIndex !== null ? (row[passthrough.allowCampaignIndex] ?? "") : "";
    const allowSms =
      passthrough.allowSmsIndex !== null ? (row[passthrough.allowSmsIndex] ?? "") : "";

    return [
      name,
      parts?.countryCode ?? "",
      parts?.local ?? "",
      contactStatus,
      allowCampaign,
      allowSms,
    ];
  });

  return {
    headers: [...CANONICAL_HEADERS],
    rows: outRows,
    foundInSource: {
      contactStatus: passthrough.contactStatusIndex !== null,
      allowCampaign: passthrough.allowCampaignIndex !== null,
      allowSms: passthrough.allowSmsIndex !== null,
    },
  };
}

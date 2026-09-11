import type { ColumnDetection } from "./types";

const STRONG_PHONE_TOKENS = [
  "phone",
  "mobile",
  "cell",
  "whatsapp",
  "msisdn",
  "telephone",
];
const WEAK_PHONE_TOKENS = ["tel", "contactnumber", "contactno", "number"];

const COUNTRY_CODE_TOKENS = [
  "countrycode",
  "dialcode",
  "diallingcode",
  "dialingcode",
  "callingcode",
  "intlcode",
  "ccode",
];

const NAME_TOKENS = [
  "fullname",
  "contactname",
  "clientname",
  "customername",
  "firstname",
  "name",
];

export const OPT_OUT_SHEET_NAME_PATTERN =
  /opt.?out|unsub|rsvp|do.?not.?contact|\bdnc\b|blacklist|suppress/i;

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesAny(normalized: string, tokens: string[]): boolean {
  return tokens.some((token) => normalized.includes(token));
}

/**
 * Best-effort detection of phone / country-code / name columns from a header row.
 * Always returns candidates for the user to confirm or override — never applied blindly.
 */
export function detectColumns(headers: string[]): ColumnDetection {
  const normalized = headers.map(normalizeHeader);

  const strongPhone = normalized
    .map((h, i) => (matchesAny(h, STRONG_PHONE_TOKENS) ? i : -1))
    .filter((i) => i >= 0);
  const weakPhone = normalized
    .map((h, i) => (matchesAny(h, WEAK_PHONE_TOKENS) ? i : -1))
    .filter((i) => i >= 0);

  const phoneCandidates = strongPhone.length > 0 ? strongPhone : weakPhone;

  const countryCodeCandidate = normalized.findIndex((h) =>
    matchesAny(h, COUNTRY_CODE_TOKENS),
  );

  const nameCandidate = normalized.findIndex((h) => matchesAny(h, NAME_TOKENS));

  return {
    phoneCandidates,
    countryCodeCandidate: countryCodeCandidate >= 0 ? countryCodeCandidate : null,
    nameCandidate: nameCandidate >= 0 ? nameCandidate : null,
  };
}

export interface PassthroughColumns {
  contactStatusIndex: number | null;
  allowCampaignIndex: number | null;
  allowSmsIndex: number | null;
}

/**
 * Finds the source columns that should be carried through verbatim into the
 * standardized output (ContactStatus / AllowCampaign / AllowSMS). Matched by
 * exact normalized header name, not fuzzy substring, since these are specific
 * known field names rather than a family of possible phrasings.
 */
export function detectPassthroughColumns(headers: string[]): PassthroughColumns {
  const normalized = headers.map(normalizeHeader);
  const find = (name: string) => {
    const idx = normalized.indexOf(name);
    return idx >= 0 ? idx : null;
  };
  return {
    contactStatusIndex: find("contactstatus"),
    allowCampaignIndex: find("allowcampaign"),
    allowSmsIndex: find("allowsms"),
  };
}

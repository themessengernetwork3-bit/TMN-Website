/**
 * Normalizes a raw phone number value into a pure-digit string, e.g. "27821234567".
 *
 * Rules (per the opt-out scrubber spec):
 *  1. Strip everything that isn't a digit.
 *  2. If a separate country-code value is supplied, strip any leading 0 from the
 *     local number and prefix it with the digits of the country code.
 *  3. Otherwise, if the number starts with a leading 0 (local format), replace it
 *     with `defaultCountryCode`.
 *  4. Otherwise the digits are used as-is (already assumed to include a country code).
 *
 * Returns null if there are no digits to work with.
 */
export function normalizePhoneNumber(
  raw: string | number | null | undefined,
  defaultCountryCode: string,
  explicitCountryCode?: string | number | null,
): string | null {
  const digits = onlyDigits(raw);
  if (!digits) return null;

  const ccDigits = onlyDigits(explicitCountryCode);
  if (ccDigits) {
    const local = digits.startsWith("0") ? digits.slice(1) : digits;
    if (!local) return null;
    return ccDigits + local;
  }

  if (digits.startsWith("0")) {
    const local = digits.slice(1);
    if (!local) return null;
    return onlyDigits(defaultCountryCode) + local;
  }

  return digits;
}

function onlyDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\D/g, "");
}

export interface PhoneParts {
  countryCode: string;
  local: string;
}

/**
 * Same normalization rules as normalizePhoneNumber, but returns the country
 * code and local number as separate parts (for exporting them into separate
 * columns). When the boundary between country code and local number can't be
 * determined confidently (no explicit country-code column, no leading 0, and
 * the digits don't start with the default country code), the country code is
 * left blank rather than guessed.
 */
export function splitPhoneNumber(
  raw: string | number | null | undefined,
  defaultCountryCode: string,
  explicitCountryCode?: string | number | null,
): PhoneParts | null {
  const digits = onlyDigits(raw);
  if (!digits) return null;

  const ccDigits = onlyDigits(explicitCountryCode);
  if (ccDigits) {
    const local = digits.startsWith("0") ? digits.slice(1) : digits;
    if (!local) return null;
    return { countryCode: ccDigits, local };
  }

  const defaultCc = onlyDigits(defaultCountryCode);

  if (digits.startsWith("0")) {
    const local = digits.slice(1);
    if (!local) return null;
    return { countryCode: defaultCc, local };
  }

  if (defaultCc && digits.startsWith(defaultCc) && digits.length > defaultCc.length) {
    return { countryCode: defaultCc, local: digits.slice(defaultCc.length) };
  }

  return { countryCode: "", local: digits };
}

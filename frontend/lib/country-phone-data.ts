import { countries, type TCountryCode } from 'countries-list';

export const AIRTIME_SUPPORTED_ISO = new Set<TCountryCode>(['KE', 'TZ', 'UG', 'RW', 'ZA']);

export type CountryPhoneOption = {
  /** Stable select value: `${iso2}|${prefix}` */
  id: string;
  code: TCountryCode;
  name: string;
  prefix: string;
  currency: string;
};

export type DialPrefixMatch = {
  digits: string;
  iso2: TCountryCode;
  /** Primary ISO 4217 code from countries-list */
  currency: string;
};

function buildCountryPhoneOptions(): CountryPhoneOption[] {
  const out: CountryPhoneOption[] = [];
  for (const iso2 of Object.keys(countries) as TCountryCode[]) {
    const data = countries[iso2];
    if (!data?.phone?.length) continue;
    const currency = data.currency[0] ?? 'USD';
    for (const p of data.phone) {
      const prefix = `+${p}`;
      out.push({
        id: `${iso2}|${prefix}`,
        code: iso2,
        name: data.name,
        prefix,
        currency,
      });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export const COUNTRY_PHONE_OPTIONS: CountryPhoneOption[] = buildCountryPhoneOptions();

export const DEFAULT_COUNTRY_PHONE_OPTION =
  COUNTRY_PHONE_OPTIONS.find((o) => o.code === 'KE') ?? COUNTRY_PHONE_OPTIONS[0]!;

/** Longest national (trunk) prefix first — match E.164 digits after stripping "+". */
function buildSortedDialPrefixes(): DialPrefixMatch[] {
  const rows: DialPrefixMatch[] = [];
  for (const iso2 of Object.keys(countries) as TCountryCode[]) {
    const data = countries[iso2];
    if (!data?.phone?.length) continue;
    const currency = data.currency[0] ?? 'USD';
    for (const p of data.phone) {
      rows.push({ digits: String(p), iso2, currency });
    }
  }
  rows.sort((a, b) => b.digits.length - a.digits.length);
  return rows;
}

const SORTED_DIAL_PREFIXES: DialPrefixMatch[] = buildSortedDialPrefixes();

export function matchDialFromPhoneDigits(phoneWithoutPlus: string): DialPrefixMatch | undefined {
  return SORTED_DIAL_PREFIXES.find((r) => phoneWithoutPlus.startsWith(r.digits));
}

/** Amount limits in local fiat for supported airtime destinations only. */
export const AIRTIME_AMOUNT_BOUNDS_BY_ISO: Partial<
  Record<TCountryCode, { lower: number; upper: number }>
> = {
  KE: { lower: 5, upper: 5000 },
  UG: { lower: 50, upper: 200000 },
  TZ: { lower: 500, upper: 200000 },
  RW: { lower: 100, upper: 40000 },
  ZA: { lower: 5, upper: 65 },
};

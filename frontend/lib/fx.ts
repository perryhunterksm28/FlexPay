/**
 * Fetch USDC → fiat rate (1 USDC = X local currency) from Coinbase public API.
 * Used when DATABASE_URL is not set (demo / local UI) or to seed missing FX rows.
 */
const FALLBACK_RATES: Record<string, number> = {
  KES: 130,
  TZS: 2800,
  UGX: 3900,
  RWF: 1350,
  ZAR: 18.5,
};

export async function fetchUsdcToFiat(currency: string): Promise<number> {
  const code = (currency || 'KES').toUpperCase();
  try {
    const response = await fetch(
      'https://api.coinbase.com/v2/exchange-rates?currency=USDC',
      {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json' },
      }
    );
    if (!response.ok) throw new Error(`Coinbase HTTP ${response.status}`);
    const data = (await response.json()) as {
      data?: { rates?: Record<string, string> };
    };
    const raw = data.data?.rates?.[code];
    if (!raw) throw new Error(`No rate for ${code}`);
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid rate for ${code}`);
    return Number.parseFloat(n.toFixed(4));
  } catch {
    return FALLBACK_RATES[code] ?? FALLBACK_RATES.KES;
  }
}

import { fetchUsdcToFiat } from '../fx';
import { isDatabaseConfigured, db } from '../db';
import type { JsonHandlerResult } from './types';

const pendingRequests = new Map<string, Promise<number>>();

export async function handlePricesGet(currencyParam: string | null): Promise<JsonHandlerResult> {
  let lastSuccessfulPrice: { price: number; updated_at: string } | null = null;

  try {
    const currency = currencyParam || 'KES';

    if (!isDatabaseConfigured()) {
      const price = await fetchUsdcToFiat(currency);
      return {
        status: 200,
        body: {
          success: true,
          price,
          demo: true,
          message: 'DATABASE_URL not set: using live or fallback FX only (no DB cache).',
        },
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const priceFromDb = (await db.price.findUnique({
      where: {
        token_currency: { token: 'USDC', currency },
      },
    })) as unknown as { price: unknown; updatedAt: Date } | null;

    const now = new Date();
    const fifteenSecondsAgo = new Date(now.getTime() - 15000);

    if (priceFromDb && priceFromDb.updatedAt > fifteenSecondsAgo) {
      const p = Number(priceFromDb.price);
      lastSuccessfulPrice = { price: p, updated_at: priceFromDb.updatedAt.toISOString() };
      return { status: 200, body: { success: true, price: p } };
    }

    const cacheKey = `USDC-${currency}`;
    if (pendingRequests.has(cacheKey)) {
      const cachedPrice = await pendingRequests.get(cacheKey)!;
      return { status: 200, body: { success: true, price: cachedPrice } };
    }

    const fetchPromise = (async (): Promise<number> => {
      let currentPrice = priceFromDb ? Number(priceFromDb.price) : 0;

      try {
        const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USDC', {
          signal: AbortSignal.timeout(5000),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data?.rates?.[currency]) {
            currentPrice = Number.parseFloat(Number.parseFloat(data.data.rates[currency]).toFixed(2));

            await db.price.upsert({
              where: {
                token_currency: { token: 'USDC', currency },
              },
              create: {
                token: 'USDC',
                currency,
                price: currentPrice,
              },
              update: {
                price: currentPrice,
              },
            });

            lastSuccessfulPrice = { price: currentPrice, updated_at: now.toISOString() };
          }
        }
      } catch (fetchError) {
        console.warn('Coinbase fetch failed, using existing price:', fetchError);
      }

      return currentPrice;
    })();

    pendingRequests.set(cacheKey, fetchPromise);

    try {
      const price = await fetchPromise;
      return { status: 200, body: { success: true, price } };
    } finally {
      pendingRequests.delete(cacheKey);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in prices API:', errorMessage);

    return {
      status: 500,
      body: {
        success: false,
        error: 'Failed to fetch price',
        details: errorMessage,
        price: lastSuccessfulPrice?.price || 0,
        using_fallback: true,
      },
    };
  }
}



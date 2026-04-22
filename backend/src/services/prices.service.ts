import { handlePricesGet } from './shared-handlers';

export async function getPrices(currency: string | null) {
  return handlePricesGet(currency);
}

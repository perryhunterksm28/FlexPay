import { NextRequest } from 'next/server';
import { handlePricesGet } from '@/lib/server/prices-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function GET(request: NextRequest) {
  const currency = request.nextUrl.searchParams.get('currency');
  const result = await handlePricesGet(currency);
  return jsonResult(result);
}

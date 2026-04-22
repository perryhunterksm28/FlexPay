import { NextRequest } from 'next/server';
import { handleGetOrderByRef } from '@/lib/server/orders-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;
  const result = await handleGetOrderByRef(orderRef);
  return jsonResult(result);
}

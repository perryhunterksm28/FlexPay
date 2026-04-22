import { NextRequest } from 'next/server';
import { handleAirtimeSendPost } from '@/lib/server/airtime-send-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await handleAirtimeSendPost(body);
  return jsonResult(result);
}

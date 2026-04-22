import { NextRequest } from 'next/server';
import { handleAirtimeValidatePost } from '@/lib/server/airtime-validate-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await handleAirtimeValidatePost(body);
  return jsonResult(result);
}

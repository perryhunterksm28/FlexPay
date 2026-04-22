import { NextRequest } from 'next/server';
import { handleAirtimeStatusPost } from '@/lib/server/airtime-status-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const result = await handleAirtimeStatusPost({
    requestId: formData.get('requestId') as string | null,
    status: formData.get('status') as string | null,
  });
  return jsonResult(result);
}

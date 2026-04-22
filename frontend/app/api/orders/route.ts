import { NextRequest } from 'next/server';
import { handleCreateOrderPost } from '@/lib/server/orders-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await handleCreateOrderPost(body);
  return jsonResult(result);
}

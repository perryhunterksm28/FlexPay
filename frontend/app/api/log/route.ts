import { NextRequest } from 'next/server';
import { handleLogPost } from '@/lib/server/log-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await handleLogPost(body);
  return jsonResult(result);
}

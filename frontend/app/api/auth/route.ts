import { NextRequest } from 'next/server';
import { handleAuthGet } from '@/lib/server/auth-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function GET(request: NextRequest) {
  const result = await handleAuthGet(request.headers.get('Authorization'), () => ({
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
  }));
  return jsonResult(result);
}

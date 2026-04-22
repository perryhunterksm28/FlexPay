import { NextRequest } from 'next/server';
import { handleGeoGet } from '@/lib/server/geo-handler';
import { jsonResult } from '@/lib/server/to-next-response';

export async function GET(request: NextRequest) {
  const result = handleGeoGet({
    country: request.headers.get('x-vercel-ip-country'),
    region: request.headers.get('x-vercel-ip-country-region'),
    city: request.headers.get('x-vercel-ip-city'),
  });
  return jsonResult(result);
}

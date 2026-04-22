import type { JsonHandlerResult } from './types';

/** Geo hints from platform (e.g. Vercel) or empty when self-hosted. */
export function handleGeoGet(headers: {
  country?: string | null;
  region?: string | null;
  city?: string | null;
}): JsonHandlerResult {
  return {
    status: 200,
    body: {
      country: headers.country ?? '',
      region: headers.region ?? '',
      city: headers.city ?? '',
    },
  };
}

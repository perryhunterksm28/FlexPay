import { handleGeoGet } from './shared-handlers';

export function getGeoFromHeaders(headers: {
  country?: string | null;
  region?: string | null;
  city?: string | null;
}) {
  return handleGeoGet(headers);
}

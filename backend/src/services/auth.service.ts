import { handleAuthGet } from './shared-handlers';

export async function verifyQuickAuth(
  authorization: string | null,
  getHeaders: () => { origin: string | null; host: string | null }
) {
  return handleAuthGet(authorization, getHeaders);
}

import { Errors, createClient } from '@farcaster/quick-auth';
import type { JsonHandlerResult } from './types';

const client = createClient();

function resolveJwtDomain(getHeaders: () => {
  origin: string | null;
  host: string | null;
}): string {
  const { origin, host } = getHeaders();
  if (origin) {
    try {
      return new URL(origin).host;
    } catch (error) {
      console.warn('Invalid origin header:', origin, error);
    }
  }
  if (host) {
    return host;
  }

  let urlValue: string;
  if (process.env.VERCEL_ENV === 'production') {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = 'http://localhost:3000';
  }

  return new URL(urlValue).host;
}

export async function handleAuthGet(
  authorization: string | null,
  getHeaders: () => { origin: string | null; host: string | null }
): Promise<JsonHandlerResult> {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { status: 401, body: { message: 'Missing token' } };
  }

  try {
    const payload = await client.verifyJwt({
      token: authorization.split(' ')[1] as string,
      domain: resolveJwtDomain(getHeaders),
    });

    const userFid = payload.sub;
    return { status: 200, body: { userFid } };
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return { status: 401, body: { message: 'Invalid token' } };
    }

    if (e instanceof Error) {
      return { status: 500, body: { message: e.message } };
    }

    throw e;
  }
}

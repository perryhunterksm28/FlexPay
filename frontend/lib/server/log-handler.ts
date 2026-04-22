import type { JsonHandlerResult } from './types';

export async function handleLogPost(body: unknown): Promise<JsonHandlerResult> {
  try {
    const parsed = body as { level?: string; message?: string; meta?: unknown } | null;
    const { level, message, meta } = parsed ?? {};

    if (!level || !message) {
      return { status: 400, body: { error: 'Missing level or message' } };
    }

    const payload = meta ? `${message} ${JSON.stringify(meta)}` : message;
    if (level === 'error') {
      console.error(payload);
    } else {
      console.log(payload);
    }

    return { status: 200, body: { ok: true } };
  } catch (error) {
    console.error('Log endpoint error:', error);
    return { status: 500, body: { error: 'Failed to log' } };
  }
}

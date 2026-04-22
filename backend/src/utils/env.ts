import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Load the same env files as the Next.js frontend, then backend-local overrides. */
export function loadAppEnv(): void {
  loadEnv({ path: resolve(__dirname, '../../../frontend/.env.local') });
  loadEnv({ path: resolve(__dirname, '../../../frontend/.env') });
  loadEnv({ path: resolve(__dirname, '../../.env') });
}

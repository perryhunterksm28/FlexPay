import { handleLogPost } from './shared-handlers';

export async function appendLog(body: unknown) {
  return handleLogPost(body);
}

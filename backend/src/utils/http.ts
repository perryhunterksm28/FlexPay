import type { Response } from 'express';
import type { JsonHandlerResult } from '../../../frontend/lib/server/types';

export function sendJson(res: Response, result: JsonHandlerResult): void {
  res.status(result.status).json(result.body);
}

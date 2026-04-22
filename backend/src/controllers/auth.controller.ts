import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendJson } from '../utils/http';

export async function getAuth(req: Request, res: Response): Promise<void> {
  const result = await authService.verifyQuickAuth(req.headers.authorization ?? null, () => ({
    origin: req.headers.origin ?? null,
    host: req.headers.host ?? null,
  }));
  sendJson(res, result);
}

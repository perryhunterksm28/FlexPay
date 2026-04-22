import type { Request, Response } from 'express';
import * as logService from '../services/log.service';
import { sendJson } from '../utils/http';

export async function postLog(req: Request, res: Response): Promise<void> {
  const result = await logService.appendLog(req.body);
  sendJson(res, result);
}

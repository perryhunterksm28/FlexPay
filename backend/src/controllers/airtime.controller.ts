import type { Request, Response } from 'express';
import * as airtimeService from '../services/airtime.service';
import { sendJson } from '../utils/http';

export async function postSend(req: Request, res: Response): Promise<void> {
  const result = await airtimeService.sendAirtime(req.body);
  sendJson(res, result);
}

export async function postValidate(req: Request, res: Response): Promise<void> {
  const result = await airtimeService.validateAirtime(req.body);
  sendJson(res, result);
}

export async function postStatus(req: Request, res: Response): Promise<void> {
  const result = await airtimeService.airtimeStatusCallback({
    requestId: (req.body as { requestId?: string }).requestId ?? null,
    status: (req.body as { status?: string }).status ?? null,
  });
  sendJson(res, result);
}

import type { Request, Response } from 'express';
import * as pricesService from '../services/prices.service';
import { sendJson } from '../utils/http';

export async function getPrices(req: Request, res: Response): Promise<void> {
  const currency = typeof req.query.currency === 'string' ? req.query.currency : null;
  const result = await pricesService.getPrices(currency);
  sendJson(res, result);
}

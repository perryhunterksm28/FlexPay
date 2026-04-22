import type { Request, Response } from 'express';
import * as geoService from '../services/geo.service';
import { sendJson } from '../utils/http';

export function getGeo(req: Request, res: Response): void {
  const result = geoService.getGeoFromHeaders({
    country: req.headers['x-vercel-ip-country'] as string | undefined,
    region: req.headers['x-vercel-ip-country-region'] as string | undefined,
    city: req.headers['x-vercel-ip-city'] as string | undefined,
  });
  sendJson(res, result);
}

/**
 * Resolves shared Next.js route handlers from `frontend/lib/server` for this process.
 * (tsx may expose named exports directly or under `.default`.)
 */
import type { JsonHandlerResult } from '../../../frontend/lib/server/types';
import * as pricesPkg from '../../../frontend/lib/server/prices-handler';
import * as ordersPkg from '../../../frontend/lib/server/orders-handler';
import * as geoPkg from '../../../frontend/lib/server/geo-handler';
import * as logPkg from '../../../frontend/lib/server/log-handler';
import * as authPkg from '../../../frontend/lib/server/auth-handler';
import * as airtimeSendPkg from '../../../frontend/lib/server/airtime-send-handler';
import * as airtimeValidatePkg from '../../../frontend/lib/server/airtime-validate-handler';
import * as airtimeStatusPkg from '../../../frontend/lib/server/airtime-status-handler';

type Named = Record<string, unknown>;

function ns(pkg: unknown): Named {
  const p = pkg as { default?: Named };
  return (p.default ?? p) as Named;
}

const p = ns(pricesPkg);
const o = ns(ordersPkg);
const g = ns(geoPkg);
const l = ns(logPkg);
const a = ns(authPkg);
const asend = ns(airtimeSendPkg);
const aval = ns(airtimeValidatePkg);
const ast = ns(airtimeStatusPkg);

export const handlePricesGet = p.handlePricesGet as (currency: string | null) => Promise<JsonHandlerResult>;
export const handleCreateOrderPost = o.handleCreateOrderPost as (body: unknown) => Promise<JsonHandlerResult>;
export const handleGetOrderByRef = o.handleGetOrderByRef as (orderRef: string) => Promise<JsonHandlerResult>;
export const handleGeoGet = g.handleGeoGet as (headers: {
  country?: string | null;
  region?: string | null;
  city?: string | null;
}) => JsonHandlerResult;
export const handleLogPost = l.handleLogPost as (body: unknown) => Promise<JsonHandlerResult>;
export const handleAuthGet = a.handleAuthGet as (
  authorization: string | null,
  getHeaders: () => { origin: string | null; host: string | null }
) => Promise<JsonHandlerResult>;
export const handleAirtimeSendPost = asend.handleAirtimeSendPost as (body: unknown) => Promise<JsonHandlerResult>;
export const handleAirtimeValidatePost = aval.handleAirtimeValidatePost as (body: unknown) => Promise<JsonHandlerResult>;
export const handleAirtimeStatusPost = ast.handleAirtimeStatusPost as (fields: {
  requestId?: string | null;
  status?: string | null;
}) => Promise<JsonHandlerResult>;

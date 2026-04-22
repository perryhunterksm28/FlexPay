import { NextResponse } from 'next/server';
import type { JsonHandlerResult } from './types';

export function jsonResult(result: JsonHandlerResult): NextResponse {
  return NextResponse.json(result.body, { status: result.status });
}

/**
 * The thin HTTP shell around the domain layer.
 *
 * Route handlers stay this short on purpose: authenticate, read the body,
 * call the domain function, answer in the dialect the existing clients parse.
 * When these domains are split into services later, the handlers move and the
 * domain functions travel with them unchanged.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export type Body = Record<string, string | string[]>;

export async function requireUser(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export const unauthorized = () =>
  NextResponse.json({ error: 'Authentication required' }, { status: 401 });

export const notFound = (what = 'Record') =>
  NextResponse.json({ error: `${what} not found` }, { status: 404 });

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

/** Create and update answer `{ data }`, which is what every client reads first. */
export const data = (payload: unknown, status = 200) =>
  NextResponse.json({ data: payload }, { status });

/**
 * Read a body in whichever dialect the caller used: the inventory and recipe
 * screens post url-encoded forms, sales and transactions post JSON. Repeated
 * keys (a recipe's `ingredients`) come back as an array.
 */
export async function readBody(request: Request): Promise<Body> {
  const type = request.headers.get('content-type') ?? '';

  if (type.includes('application/json')) {
    const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const out: Body = {};
    for (const [k, v] of Object.entries(raw)) {
      out[k] = Array.isArray(v) ? v.map(String) : String(v ?? '');
    }
    return out;
  }

  const text =
    type.includes('application/x-www-form-urlencoded') || !type
      ? await request.text()
      : await request.text();

  const params = new URLSearchParams(text);
  const out: Body = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

export const one = (b: Body, ...keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = b[k];
    if (v === undefined) continue;
    return Array.isArray(v) ? v[0] : v;
  }
  return undefined;
};

export const many = (b: Body, ...keys: string[]): string[] => {
  for (const k of keys) {
    const v = b[k];
    if (v === undefined) continue;
    return Array.isArray(v) ? v : [v];
  }
  return [];
};

export const num = (v: string | undefined, fallback?: number): number | undefined => {
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** One place where an unexpected failure becomes a 500 instead of a stack trace. */
export async function handle<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (error) {
    console.error('[api]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    );
  }
}

/** Query parameters every list endpoint accepts. */
export function listParams(request: Request, defaultLimit: number) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = Number.parseInt(url.searchParams.get('limit') ?? String(defaultLimit), 10);
  return {
    search: url.searchParams.get('search') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : defaultLimit,
  };
}

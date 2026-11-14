/**
 * The database handle.
 *
 * One pool per process, reused across hot reloads in development and across
 * warm invocations in production. On Vercel each serverless instance holds its
 * own small pool, so point DATABASE_URL at a pooled endpoint (Neon's `-pooler`
 * host, or any PgBouncer) rather than the direct one.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env.local and point it at your Postgres.',
  );
}

const globalForDb = globalThis as unknown as { __inventiumPool?: Pool };

const pool =
  globalForDb.__inventiumPool ??
  new Pool({
    connectionString,
    // Serverless instances are many and short-lived; keep each one's pool small.
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__inventiumPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool, schema };

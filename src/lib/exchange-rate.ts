/**
 * Where a rate comes from — and the only place that will ever change when it
 * starts coming from a rate service.
 *
 * This is the same seam shape as `src/lib/*-server.ts`: one async function the
 * callers await, whose body is free to become a `fetch`. It is async today even
 * though reading an environment variable is not, precisely so that turning on a
 * live provider is a change to this file and nothing else. No caller has to
 * learn that rates became slow.
 *
 * ## Adding a live provider
 *
 * 1. Write a function with the `RateProvider` shape below.
 * 2. Register it in `PROVIDERS` under the name `EXCHANGE_RATE_PROVIDER` selects.
 * 3. Set `EXCHANGE_RATE_PROVIDER` and whatever key that provider needs.
 *
 * The contract a provider must keep: it is called on the server, it may throw
 * or return `null`, and `getRate` falls back to the configured rate when it
 * does. A rate service being down must never blank a screen or, worse, convert
 * money at a number nobody can account for.
 */

import type { Rate } from './currency';

/** Returns a quoted rate, or `null` when it cannot quote one. May throw. */
export type RateProvider = () => Promise<{ vndPerUsd: number; asOf: string | null } | null>;

/**
 * A fallback, used only when nothing is configured. Deliberately a round
 * number: it is an order of magnitude, not a quote, and reads as one on screen,
 * where `rateNote` marks it as a placeholder.
 */
const FALLBACK_VND_PER_USD = 26_000;

/**
 * No live provider is registered yet. The map exists so adding one is a
 * registration rather than an `if` grown through this function.
 */
const PROVIDERS: Record<string, RateProvider> = {};

/** The rate as configuration: what `.env` says, or the placeholder. */
function configuredRate(): Rate {
  const raw = process.env.NEXT_PUBLIC_USD_VND_RATE?.trim();
  const parsed = raw ? Number(raw) : NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { vndPerUsd: FALLBACK_VND_PER_USD, asOf: null, source: 'fallback' };
  }

  return {
    vndPerUsd: parsed,
    asOf: process.env.NEXT_PUBLIC_USD_VND_RATE_AS_OF?.trim() || null,
    source: 'configured',
  };
}

/**
 * The rate to convert with, resolved once per server render.
 *
 * A registered provider is tried first and its failure is logged, not thrown:
 * the screen still renders, at the configured rate, and says so.
 */
export async function getRate(): Promise<Rate> {
  const name = process.env.EXCHANGE_RATE_PROVIDER?.trim();
  const provider = name ? PROVIDERS[name] : undefined;

  if (name && !provider) {
    console.warn(
      `EXCHANGE_RATE_PROVIDER is set to "${name}", which is not registered. Using the configured rate.`,
    );
  }

  if (provider) {
    try {
      const quoted = await provider();
      if (quoted && Number.isFinite(quoted.vndPerUsd) && quoted.vndPerUsd > 0) {
        return {
          vndPerUsd: quoted.vndPerUsd,
          asOf: quoted.asOf,
          source: 'live',
          provider: name,
        };
      }
      console.warn(`Rate provider "${name}" returned no usable quote. Using the configured rate.`);
    } catch (error) {
      console.error(`Rate provider "${name}" failed. Using the configured rate.`, error);
    }
  }

  return configuredRate();
}

/**
 * The rate without awaiting anything, for the handful of places that cannot.
 *
 * It never consults a provider, so it can disagree with `getRate`. Prefer
 * passing the resolved rate down from a Server Component; reach for this only
 * where there is nothing to await in.
 */
export function configuredRateSync(): Rate {
  return configuredRate();
}

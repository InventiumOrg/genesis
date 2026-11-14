/**
 * Shared pieces of the backend domain layer.
 *
 * Every function in `src/server` returns rows in the dialect the old REST
 * services spoke — PascalCase keys — so the existing mappers in `src/lib`
 * read them unchanged. That is deliberate: the data moved into this repo,
 * the contract did not.
 */

/** The live thresholds stock state is derived from, as the UI also reads them. */
export const STOCK_OK_AT = 50;
export const STOCK_LOW_AT = 10;

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export function paginate(totalItems: number, page: number, limit: number): Pagination {
  return {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    totalItems,
    itemsPerPage: limit,
  };
}

/** Read a positive integer query parameter, falling back when absent or junk. */
export function intParam(value: string | null | undefined, fallback: number): number {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function isoOrNow(d: Date | null | undefined): string {
  return (d ?? new Date()).toISOString();
}

/** Round a float to the precision quantities are kept at, killing 0.1+0.2 drift. */
export function q(n: number): number {
  return Math.round(n * 1000) / 1000;
}

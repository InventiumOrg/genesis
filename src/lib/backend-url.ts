/**
 * Backend gateway base: NEXT_BACKEND_API_URI or NEXT_PUBLIC_BACKEND_API_URI
 * Examples:
 *   http://localhost/v1  → …/inventory, …/warehouse, …/pos, …/orders, …/recipe, …/sales
 *   http://localhost/v1/{service_name_without_prefix_service}  → placeholder replaced per service
 */
export type BackendServiceKey =
  | 'inventory'
  | 'warehouse'
  | 'pos'
  | 'orders'
  | 'recipe'
  | 'sale'
  | 'transactions';

const SERVICE_PLACEHOLDER = '{service_name_without_prefix_service}';

const DEFAULT_URI = 'http://localhost/v1';

function resolveTemplate(): string {
  const v =
    process.env.NEXT_PUBLIC_BACKEND_API_URI?.trim() ||
    process.env.NEXT_BACKEND_API_URI?.trim();
  return v || DEFAULT_URI;
}

/**
 * Base URL for one domain, e.g. `/api/v1/inventory`.
 *
 * Transactions used to resolve through a second variable of their own
 * (`NEXT_PUBLIC_TRANSACTIONS_API_URI`), because the old split deployment put
 * them behind a different path from the other services. They are served by this
 * app now, at `/api/v1/transactions` like every sibling, so they go through the
 * same template. The derive it used instead — `new URL(template).origin` — threw
 * on the relative `/api/v1` this app sets and fell back to an absolute
 * `http://localhost`, which no browser but the developer's own could reach.
 */
export function backendServiceBaseUrl(service: BackendServiceKey): string {
  const template = resolveTemplate().replace(/\/+$/, '');
  if (template.includes(SERVICE_PLACEHOLDER)) {
    return template.replace(SERVICE_PLACEHOLDER, service);
  }
  return `${template}/${service}`;
}

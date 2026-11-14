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
 * Inventory transactions (import/export) share a single collection endpoint at
 * `/api/v1/transactions`. Override with NEXT_PUBLIC_TRANSACTIONS_API_URI, else
 * derive `{origin}/api/v1/transactions` from the main backend base.
 */
function resolveTransactionsBase(): string {
  const explicit = process.env.NEXT_PUBLIC_TRANSACTIONS_API_URI?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const template = resolveTemplate();
  try {
    const origin = new URL(template).origin;
    return `${origin}/api/v1/transactions`;
  } catch {
    return 'http://localhost/api/v1/transactions';
  }
}

/** Base URL for one microservice, e.g. http://localhost/v1/inventory */
export function backendServiceBaseUrl(service: BackendServiceKey): string {
  if (service === 'transactions') {
    return resolveTransactionsBase();
  }

  const template = resolveTemplate().replace(/\/+$/, '');
  if (template.includes(SERVICE_PLACEHOLDER)) {
    return template.replace(SERVICE_PLACEHOLDER, service);
  }
  return `${template}/${service}`;
}

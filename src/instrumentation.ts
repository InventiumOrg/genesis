import type { Instrumentation } from 'next';
import { isOtelEnabled } from '@/lib/otel-config';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && isOtelEnabled()) {
    const { startNodeOtel } = await import('./instrumentation.node');
    startNodeOtel();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (!isOtelEnabled()) {
    return;
  }

  try {
    const { log } = await import('@/lib/otel-logger');
    log.error('request error', error, {
      path: request.path,
      method: request.method,
      router_kind: context.routerKind,
      route_path: context.routePath,
      route_type: context.routeType,
    });
  } catch {
    console.error('[otel] failed to emit request error log', error);
  }
};

/**
 * Shared OpenTelemetry env helpers (safe to import from server code only).
 */

export function isOtelEnabled(): boolean {
  return process.env.OTEL_SDK_DISABLED !== 'true';
}

export function getServiceName(): string {
  return process.env.OTEL_SERVICE_NAME ?? 'frontend-service';
}

/** OTLP HTTP endpoint for traces or logs (OTEL spec–friendly). */
export function getOtlpEndpoint(kind: 'traces' | 'logs'): string {
  const specific =
    kind === 'traces'
      ? process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
      : process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;

  if (specific?.trim()) {
    return specific.trim();
  }

  const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim().replace(/\/$/, '');
  if (base) {
    if (base.endsWith('/v1/traces') || base.endsWith('/v1/logs')) {
      return kind === 'traces'
        ? base.replace(/\/v1\/logs$/, '/v1/traces')
        : base.replace(/\/v1\/traces$/, '/v1/logs');
    }
    return `${base}/v1/${kind}`;
  }

  return `http://localhost:4318/v1/${kind}`;
}

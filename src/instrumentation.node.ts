import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  getOtlpEndpoint,
  getServiceName,
  isOtelEnabled,
} from '@/lib/otel-config';

let sdk: NodeSDK | undefined;

export function startNodeOtel(): void {
  if (!isOtelEnabled()) {
    console.info('[otel] SDK disabled (OTEL_SDK_DISABLED=true)');
    return;
  }

  if (sdk) {
    return;
  }

  const serviceName = getServiceName();
  const environment = process.env.NODE_ENV ?? 'development';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.0',
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: environment,
  });

  const traceExporter = new OTLPTraceExporter({
    url: getOtlpEndpoint('traces'),
  });

  const logExporter = new OTLPLogExporter({
    url: getOtlpEndpoint('logs'),
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  console.info(
    `[otel] NodeSDK started (service=${serviceName}, traces=${getOtlpEndpoint('traces')}, logs=${getOtlpEndpoint('logs')})`,
  );

  const shutdown = () => {
    sdk
      ?.shutdown()
      .then(() => console.info('[otel] SDK shut down'))
      .catch((err) => console.error('[otel] shutdown error', err));
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

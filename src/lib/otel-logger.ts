import { trace } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { getServiceName } from '@/lib/otel-config';

type LogAttributes = Record<string, string | number | boolean | undefined>;

function activeTraceFields(): LogAttributes {
  const span = trace.getActiveSpan();
  const ctx = span?.spanContext();
  if (!ctx?.traceId) {
    return {};
  }
  return {
    trace_id: ctx.traceId,
    span_id: ctx.spanId,
  };
}

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  message: string,
  attributes?: LogAttributes,
  error?: unknown,
) {
  const logger = logs.getLogger(getServiceName());
  const attrs: LogAttributes = {
    ...activeTraceFields(),
    ...attributes,
  };

  if (error instanceof Error) {
    attrs.error_type = error.name;
    attrs.error_message = error.message;
    if (error.stack) {
      attrs.error_stack = error.stack;
    }
  } else if (error !== undefined) {
    attrs.error_message = String(error);
  }

  logger.emit({
    severityNumber,
    severityText,
    body: message,
    attributes: attrs,
  });
}

export const log = {
  debug(message: string, attributes?: LogAttributes) {
    emit(SeverityNumber.DEBUG, 'DEBUG', message, attributes);
  },
  info(message: string, attributes?: LogAttributes) {
    emit(SeverityNumber.INFO, 'INFO', message, attributes);
  },
  warn(message: string, attributes?: LogAttributes) {
    emit(SeverityNumber.WARN, 'WARN', message, attributes);
  },
  error(message: string, error?: unknown, attributes?: LogAttributes) {
    emit(SeverityNumber.ERROR, 'ERROR', message, attributes, error);
  },
};

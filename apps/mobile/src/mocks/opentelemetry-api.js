// Mock for @opentelemetry/api — incompatible with Hermes (dynamic import)
const noop = () => {};
const noopSpan = { end: noop, setStatus: noop, recordException: noop, setAttribute: noop, addEvent: noop };
const noopTracer = {
  startActiveSpan: (name, fn) => fn(noopSpan),
  startSpan: () => noopSpan,
};

module.exports = {
  trace: { getTracer: () => noopTracer, getActiveSpan: () => noopSpan },
  context: { with: (ctx, fn) => fn(), active: () => ({}) },
  propagation: { inject: noop, extract: () => ({}) },
  diag: { setLogger: noop, error: noop, warn: noop, info: noop, debug: noop },
  SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
  SpanKind: { INTERNAL: 0, SERVER: 1, CLIENT: 2 },
};

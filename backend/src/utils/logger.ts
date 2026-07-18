/**
 * Structured single-line JSON logger (shared, app-wide).
 *
 * Repo convention is console logging (captured by the host platform, e.g.
 * Vercel); this adds machine-parseable structure and correlation IDs without
 * pulling in a logging dependency. Mirrors the verification module's logger so
 * log shape is consistent across the codebase.
 *
 * NEVER pass secrets (auth keys, OTPs, Aadhaar numbers, raw provider payloads
 * containing PII) into this logger.
 */

type LogLevel = "info" | "warn" | "error";

interface LogFields {
  module?: string;
  correlationId?: string;
  [key: string]: unknown;
}

const emit = (level: LogLevel, message: string, fields: LogFields = {}) => {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...fields
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields)
};

/**
 * Create a logger bound to a fixed set of fields (e.g. a module name), so
 * every line carries them without repetition.
 */
export const createScopedLogger = (scope: LogFields) => ({
  info: (message: string, fields?: LogFields) => emit("info", message, { ...scope, ...fields }),
  warn: (message: string, fields?: LogFields) => emit("warn", message, { ...scope, ...fields }),
  error: (message: string, fields?: LogFields) => emit("error", message, { ...scope, ...fields })
});

import pino from "pino";

// Create Pino logger instance
const isDev = process.env.NODE_ENV === "development";

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Logger instance for structured logging
 * 
 * Usage:
 * ```typescript
 * logger.info({ userId: "123" }, "User logged in");
 * logger.error({ err }, "Error occurred");
 * logger.warn("Warning message");
 * ```
 */
export const logger = {
  debug: (meta: any, msg?: string) => pinoLogger.debug(meta, msg || ""),
  info: (meta: any, msg?: string) => pinoLogger.info(meta, msg || ""),
  warn: (meta: any, msg?: string) => pinoLogger.warn(meta, msg || ""),
  error: (meta: any, msg?: string) => pinoLogger.error(meta, msg || ""),
  fatal: (meta: any, msg?: string) => pinoLogger.fatal(meta, msg || ""),
};

export type Logger = typeof logger;

import * as Sentry from "@sentry/nextjs";
import { env } from "./env";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Should be called in middleware and instrumentation file
 */
export function initializeSentry() {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log("⚠️  Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: env.NODE_ENV === "development",
    integrations: [
      Sentry.httpClientIntegration({
        failedRequestStatusCodes: [400, 401, 403, 404, [500, 599]],
      }),
    ],
  });

  console.log("✅ Sentry initialized for error tracking");
}

/**
 * Capture an error with additional context
 * @param error - Error object
 * @param context - Additional context information
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture a message
 * @param message - Message to capture
 * @param level - Log level
 */
export function captureMessage(message: string, level: "fatal" | "error" | "warning" | "info" | "debug" = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 * @param userId - User ID
 * @param email - User email (optional)
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

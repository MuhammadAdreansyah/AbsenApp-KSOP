// instrumentation.ts - Initialize monitoring tools
import { env } from "@/lib/env";

// Initialize monitoring in production
export async function register() {
  // Sentry initialization (optional, requires environment variables)
  if (process.env.NODE_ENV === "production" && env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.init({
        dsn: env.NEXT_PUBLIC_SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: 0.1,
        integrations: [],
      });
      console.log("✅ Sentry initialized in production");
    } catch (error) {
      console.warn("⚠️  Sentry initialization failed", error);
    }
  }

  console.log("🚀 Application instrumentation initialized");
}

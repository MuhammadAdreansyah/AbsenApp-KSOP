import { z } from "zod";

// Define environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL").optional(),

  // Supabase (Optional for production)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PDF_BUCKET: z.string().default("daily-pdfs"),

  // Cron Secret
  CRON_SECRET: z.string().min(32, "CRON_SECRET must be at least 32 characters"),

  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Letterhead
  NEXT_PUBLIC_LETTERHEAD_URL: z.string().url().optional(),

  // Sentry (Optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Node env
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parse and validate environment variables
const validateEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((e) => e.code === "invalid_type")
        .map((e) => `${e.path.join(".")} (${e.message})`)
        .join("\n");

      const invalidVars = error.issues
        .filter((e) => e.code !== "invalid_type")
        .map((e) => `${e.path.join(".")} (${e.message})`)
        .join("\n");

      const message = [
        "❌ Invalid environment variables:",
        missingVars && `\nMissing:\n${missingVars}`,
        invalidVars && `\nInvalid format:\n${invalidVars}`,
      ]
        .filter(Boolean)
        .join("");

      console.error(message);
      throw new Error("Environment validation failed");
    }

    throw error;
  }
};

// Export validated env
export const env = validateEnv();

// Type-safe environment export
export type Env = z.infer<typeof envSchema>;

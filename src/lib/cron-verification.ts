import { NextResponse } from "next/server";

/**
 * Verify Vercel Cron Secret
 * Use this in all cron job endpoints for security
 * 
 * @param request - Next.js Request object
 * @returns { success: true } if valid, or NextResponse with 401 error if invalid
 * 
 * @example
 * export async function POST(request: Request) {
 *   const cronValidation = verifyCronSecret(request);
 *   if (cronValidation instanceof NextResponse) {
 *     return cronValidation;
 *   }
 *   // ... rest of cron logic
 * }
 */
export function verifyCronSecret(request: Request): { success: true } | NextResponse {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Check if secret is configured
  if (!cronSecret) {
    console.error("❌ CRON_SECRET not configured in environment variables");
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  // Verify bearer token
  const expectedAuth = `Bearer ${cronSecret}`;
  if (authHeader !== expectedAuth) {
    console.warn("⚠️ Unauthorized CRON request - invalid or missing secret");
    return NextResponse.json(
      { error: "Unauthorized - Invalid CRON_SECRET" },
      { status: 401 }
    );
  }

  console.log("✅ CRON request authorized");
  return { success: true };
}

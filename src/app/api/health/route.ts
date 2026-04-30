import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/health
 * Health check endpoint for monitoring and uptime tracking
 * Returns system status including database connectivity
 */
export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connectivity
    const dbHealth = await checkDatabaseHealth();
    const responseTime = Date.now() - startTime;

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || "unknown",
      services: {
        database: dbHealth.status,
        api: "operational",
      },
      version: process.env.npm_package_version || "unknown",
    };

    logger.info(healthStatus, "Health check passed");

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    logger.error({ error }, "Health check failed");

    const unhealthyStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      services: {
        database: "unavailable",
        api: "operational",
      },
    };

    return NextResponse.json(unhealthyStatus, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}

/**
 * Check database health by running a simple query
 */
async function checkDatabaseHealth(): Promise<{ status: string; latency: number }> {
  try {
    const start = Date.now();
    await prisma.dailyLog.count();
    const latency = Date.now() - start;

    return {
      status: "connected",
      latency,
    };
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    throw new Error("Database connection failed");
  }
}

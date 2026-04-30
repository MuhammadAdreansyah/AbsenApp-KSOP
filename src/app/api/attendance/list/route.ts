import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePaginationParams, calculateSkip, createPaginatedResponse } from "@/lib/pagination";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_ATTENDANCE = 100; // 100 requests per minute

/**
 * GET /api/attendance
 * Get attendance records with pagination
 * Query params: ?page=1&limit=20&date=2026-04-28&meetingCode=default
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(clientIp, "attendance-list", RATE_LIMIT_ATTENDANCE);
    if (!rateLimitResult.allowed) {
      logger.warn({ ip: clientIp }, "Rate limit exceeded on attendance list");
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || undefined;
    const limit = searchParams.get("limit") || undefined;
    const dateParam = searchParams.get("date");
    const meetingCode = searchParams.get("meetingCode") || "default";

    // Validate pagination
    const { page: pageNum, limit: limitNum } = validatePaginationParams(page, limit);

    // Build where clause
    const where: any = { meetingCode };

    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        where.dailyLog = {
          date: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate()),
          },
        };
      }
    }

    // Get total count
    const total = await prisma.attendanceRecord.count({ where });

    // Get paginated data
    const records = await prisma.attendanceRecord.findMany({
      where,
      select: {
        id: true,
        nama: true,
        nip: true,
        agenda: true,
        meetingCode: true,
        createdAt: true,
        dailyLog: {
          select: {
            date: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: calculateSkip(pageNum, limitNum),
      take: limitNum,
    });

    logger.info(
      { ip: clientIp, page: pageNum, limit: limitNum, total },
      "Attendance list fetched"
    );

    const response = createPaginatedResponse(records, total, pageNum, limitNum);

    return NextResponse.json(
      { success: true, ...response },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error, ip: clientIp }, "Error fetching attendance list");
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data absensi",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

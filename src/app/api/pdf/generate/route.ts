// src/app/api/pdf/generate/route.ts
// API Route untuk Generate Daily Recap PDF

import { NextRequest, NextResponse } from "next/server";
import { generateDailyRecapPDF } from "@/lib/pdf/generator";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limit: 20 PDF generations per minute per IP
const RATE_LIMIT_PDF = 20;

function parseLocalDateInput(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

/**
 * POST /api/pdf/generate
 * Generate PDF untuk date tertentu
 *
 * Body:
 * {
 *   "date": "2026-04-16", // ISO date string
 *   "letterheadImageUrl": "https://...", // optional
 *   "institutionName": "Institusi Resmi" // optional
 * }
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(clientIp, "pdf-generate", RATE_LIMIT_PDF);
    if (!rateLimitResult.allowed) {
      logger.warn({ ip: clientIp, endpoint: "pdf-generate" }, "Rate limit exceeded");
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    const body = await request.json();
    const { date, dailyLogId, meetingCode, letterheadImageUrl, institutionName, meetingPlace, meetingTitle } = body;

    if (!dailyLogId && !date) {
      logger.warn({ ip: clientIp }, "PDF generation: missing required parameters");
      return NextResponse.json(
        { success: false, message: "dailyLogId atau date wajib diisi" },
        { status: 400 }
      );
    }

    let result;

    if (dailyLogId) {
      result = await generateDailyRecapPDF({
        dailyLogId,
        meetingCode: meetingCode ? sanitizeInput(meetingCode) : undefined,
        letterheadImageUrl: letterheadImageUrl ? sanitizeInput(letterheadImageUrl) : undefined,
        institutionName: institutionName ? sanitizeInput(institutionName) : undefined,
        meetingPlace: meetingPlace ? sanitizeInput(meetingPlace) : undefined,
        meetingTitle: meetingTitle ? sanitizeInput(meetingTitle) : undefined,
      });
    } else {
      const parsedDate = parseLocalDateInput(date);
      if (!parsedDate) {
        logger.warn({ ip: clientIp, date }, "Invalid date format");
        return NextResponse.json(
          { success: false, message: "Format date tidak valid (gunakan ISO format)" },
          { status: 400 }
        );
      }

      result = await generateDailyRecapPDF({
        date: parsedDate,
        meetingCode: meetingCode ? sanitizeInput(meetingCode) : undefined,
        letterheadImageUrl: letterheadImageUrl ? sanitizeInput(letterheadImageUrl) : undefined,
        institutionName: institutionName ? sanitizeInput(institutionName) : undefined,
        meetingPlace: meetingPlace ? sanitizeInput(meetingPlace) : undefined,
        meetingTitle: meetingTitle ? sanitizeInput(meetingTitle) : undefined,
      });
    }

    if (!result.success) {
      logger.warn({ ip: clientIp, result }, "PDF generation failed");
      return NextResponse.json(result, { status: 400 });
    }

    logger.info({ ip: clientIp, dailyLogId }, "PDF generated successfully");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error, ip: clientIp }, "Error in PDF generate API");
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghasilkan PDF",
        error: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pdf/generate?date=2026-04-16
 * Get PDF URL untuk date tertentu atau generate jika belum ada
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(clientIp, "pdf-generate", RATE_LIMIT_PDF);
    if (!rateLimitResult.allowed) {
      logger.warn({ ip: clientIp }, "Rate limit exceeded on PDF GET");
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const letterheadImageUrl = searchParams.get("letterheadImageUrl");
    const institutionName = searchParams.get("institutionName");
    const meetingPlace = searchParams.get("meetingPlace");
    const meetingTitle = searchParams.get("meetingTitle");
    const meetingCode = searchParams.get("meetingCode");

    if (!dateParam) {
      logger.warn({ ip: clientIp }, "PDF GET: missing date parameter");
      return NextResponse.json(
        { success: false, message: "Date parameter diperlukan" },
        { status: 400 }
      );
    }

    const date = parseLocalDateInput(dateParam);
    if (!date) {
      logger.warn({ ip: clientIp, dateParam }, "Invalid date format in GET");
      return NextResponse.json(
        { success: false, message: "Format date tidak valid" },
        { status: 400 }
      );
    }

    // Generate PDF
    const result = await generateDailyRecapPDF({
      date,
      meetingCode: meetingCode ? sanitizeInput(meetingCode) : undefined,
      letterheadImageUrl: letterheadImageUrl ? sanitizeInput(letterheadImageUrl) : undefined,
      institutionName: institutionName ? sanitizeInput(institutionName) : undefined,
      meetingPlace: meetingPlace ? sanitizeInput(meetingPlace) : undefined,
      meetingTitle: meetingTitle ? sanitizeInput(meetingTitle) : undefined,
    });

    if (!result.success) {
      logger.warn({ ip: clientIp, result }, "PDF GET generation failed");
      return NextResponse.json(result, { status: 400 });
    }

    logger.info({ ip: clientIp, date: dateParam }, "PDF generated via GET");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error({ error, ip: clientIp }, "Error in PDF generate API (GET)");
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghasilkan PDF",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

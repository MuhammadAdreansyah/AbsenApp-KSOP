// src/app/api/pdf/generate/route.ts
// API Route untuk Generate Daily Recap PDF

import { NextRequest, NextResponse } from "next/server";
import { generateDailyRecapPDF } from "@/lib/pdf/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  try {
    const body = await request.json();
    const { date, dailyLogId, meetingCode, letterheadImageUrl, institutionName, meetingPlace, meetingTitle } = body;

    if (!dailyLogId && !date) {
      return NextResponse.json(
        { success: false, message: "dailyLogId atau date wajib diisi" },
        { status: 400 }
      );
    }

    let result;

    if (dailyLogId) {
      result = await generateDailyRecapPDF({
        dailyLogId,
        meetingCode,
        letterheadImageUrl,
        institutionName,
        meetingPlace,
        meetingTitle,
      });
    } else {
      const parsedDate = parseLocalDateInput(date);
      if (!parsedDate) {
        return NextResponse.json(
          { success: false, message: "Format date tidak valid (gunakan ISO format)" },
          { status: 400 }
        );
      }

      result = await generateDailyRecapPDF({
        date: parsedDate,
        meetingCode,
        letterheadImageUrl,
        institutionName,
        meetingPlace,
        meetingTitle,
      });
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in PDF generate API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghasilkan PDF",
        error: message,
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const letterheadImageUrl = searchParams.get("letterheadImageUrl");
    const institutionName = searchParams.get("institutionName");
    const meetingPlace = searchParams.get("meetingPlace");
    const meetingTitle = searchParams.get("meetingTitle");
    const meetingCode = searchParams.get("meetingCode");

    if (!dateParam) {
      return NextResponse.json(
        { success: false, message: "Date parameter diperlukan" },
        { status: 400 }
      );
    }

    const date = parseLocalDateInput(dateParam);
    if (!date) {
      return NextResponse.json(
        { success: false, message: "Format date tidak valid" },
        { status: 400 }
      );
    }

    // Generate PDF
    const result = await generateDailyRecapPDF({
      date,
      meetingCode: meetingCode || undefined,
      letterheadImageUrl: letterheadImageUrl || undefined,
      institutionName: institutionName || undefined,
      meetingPlace: meetingPlace || undefined,
      meetingTitle: meetingTitle || undefined,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in PDF generate API (GET):", error);
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

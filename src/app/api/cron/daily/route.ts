// src/app/api/cron/daily/route.ts
// Daily Cron Job: Freeze daily log, generate PDF, create new daily log

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDailyRecapPDF } from "@/lib/pdf/generator";

export async function POST(req: Request) {
  try {
    // Verify Vercel Cron Secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's daily log
    const todayLog = await prisma.dailyLog.findUnique({
      where: { date: today },
      include: { attendanceRecords: true },
    });

    if (todayLog && todayLog.status === "ACTIVE") {
      // Step 1: Generate PDF for today
      if (todayLog.attendanceRecords.length > 0) {
        await generateDailyRecapPDF({
          date: today,
          institutionName: "Institusi Resmi",
          letterheadImageUrl: process.env.NEXT_PUBLIC_LETTERHEAD_URL,
        });
      }

      // Step 2: Freeze today's log
      await prisma.dailyLog.update({
        where: { id: todayLog.id },
        data: { status: "FROZEN" },
      });
    }

    // Step 3: Create new log untuk hari berikutnya (atau sudah ada)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTomorrow = await prisma.dailyLog.findUnique({
      where: { date: tomorrow },
    });

    if (!existingTomorrow) {
      await prisma.dailyLog.create({
        data: {
          date: tomorrow,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Daily cron executed successfully",
        frozenLog: todayLog ? todayLog.id : null,
        recordsCount: todayLog?.attendanceRecords.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Daily cron error:", error);
    return NextResponse.json(
      {
        error: "Daily cron failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint untuk testing
export async function GET(req: Request) {
  // Only allow local testing
  const url = new URL(req.url);
  if (!url.hostname.includes("localhost") && process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "GET not allowed in production" },
      { status: 405 }
    );
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = await prisma.dailyLog.findUnique({
      where: { date: today },
      include: { attendanceRecords: true },
    });

    return NextResponse.json(
      {
        message: "GET test endpoint",
        today: today.toISOString(),
        todayLog,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// src/app/api/cron/monthly/route.ts
// Monthly Cron Job: Archive all daily logs from previous month

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = previousMonth.getMonth() + 1;
    const year = previousMonth.getFullYear();

    // Check if archive untuk bulan ini sudah ada
    const existingArchive = await prisma.monthlyArchive.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
    });

    if (existingArchive && existingArchive.status === "ARCHIVED") {
      return NextResponse.json(
        {
          message: "Archive for this month already exists",
          archive: existingArchive,
        },
        { status: 200 }
      );
    }

    // Get all daily logs dari bulan sebelumnya
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const dailyLogs = await prisma.dailyLog.findMany({
      where: {
        date: {
          gte: firstDay,
          lte: lastDay,
        },
        status: "FROZEN", // Only archive frozen logs
      },
      include: { attendanceRecords: true },
    });

    if (dailyLogs.length === 0) {
      return NextResponse.json(
        {
          message: "No frozen daily logs found for this month",
          month,
          year,
        },
        { status: 200 }
      );
    }

    // Create MonthlyArchive record
    const archive = await prisma.monthlyArchive.create({
      data: {
        month,
        year,
        status: "ACTIVE",
        dailyLogs: {
          connect: dailyLogs.map((log) => ({ id: log.id })),
        },
      },
      include: { dailyLogs: true },
    });

    // TODO: Generate ZIP file dari PDF files dan upload

    // Mark archive as ARCHIVED
    const archivedRecord = await prisma.monthlyArchive.update({
      where: { id: archive.id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Monthly archive created successfully",
        archive: archivedRecord,
        logsArchived: dailyLogs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Monthly cron error:", error);
    return NextResponse.json(
      {
        error: "Monthly cron failed",
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
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = previousMonth.getMonth() + 1;
    const year = previousMonth.getFullYear();

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const dailyLogs = await prisma.dailyLog.findMany({
      where: {
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      include: { _count: { select: { attendanceRecords: true } } },
    });

    const archive = await prisma.monthlyArchive.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
      include: { _count: { select: { dailyLogs: true } } },
    });

    return NextResponse.json(
      {
        message: "GET test endpoint",
        month,
        year,
        dailyLogsFound: dailyLogs.length,
        dailyLogs,
        existingArchive: archive,
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

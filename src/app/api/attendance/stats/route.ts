// src/app/api/attendance/stats/route.ts
// Lightweight API endpoint untuk fetch statistik attendance real-time
// OPTIMISASI: Exclude signatureUrl dari response untuk reduce payload

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0; // No cache

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const meetingCode = url.searchParams.get("meetingCode") || "default";

    // Get today's date range in UTC (PENTING: match dengan attendance.ts logic)
    const today = new Date();
    const utcYear = today.getUTCFullYear();
    const utcMonth = today.getUTCMonth();
    const utcDay = today.getUTCDate();
    const utcMidnight = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0, 0));
    const tomorrowMidnight = new Date(Date.UTC(utcYear, utcMonth, utcDay + 1, 0, 0, 0, 0));

    const dailyLog = await prisma.dailyLog.findFirst({
      where: {
        date: {
          gte: utcMidnight,
          lt: tomorrowMidnight,
        },
      },
      include: {
        attendanceRecords: {
          where: {
            meetingCode,
          },
          select: {
            id: true,
            nama: true,
            nip: true,
            // jabatan: true, // TODO: Uncomment after migration is applied
            agenda: true,
            // PENTING: EXCLUDE signatureUrl untuk reduce payload size
            // Signature di-load on-demand via separate endpoint jika diperlukan
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!dailyLog) {
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          date: utcMidnight.toISOString(),
          status: "ACTIVE",
          pdfUrl: null,
          attendanceRecords: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dailyLog.id,
        date: dailyLog.date.toISOString(),
        status: dailyLog.status,
        pdfUrl: dailyLog.pdfUrl ?? null,
        attendanceRecords: dailyLog.attendanceRecords.map((record) => ({
          id: record.id,
          nama: record.nama,
          nip: record.nip,
          // jabatan: record.jabatan, // TODO: Uncomment after migration
          agenda: record.agenda,
          // Jangan include signatureUrl - ini reduce payload drastis!
          createdAt:
            record.createdAt instanceof Date
              ? record.createdAt.toISOString()
              : record.createdAt,
        })),
      },
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal fetch statistik absensi",
      },
      { status: 500 }
    );
  }
}

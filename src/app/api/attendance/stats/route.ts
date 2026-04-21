// src/app/api/attendance/stats/route.ts
// Lightweight API endpoint untuk fetch statistik attendance real-time

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const meetingCode = url.searchParams.get("meetingCode") || "default";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyLog = await prisma.dailyLog.findUnique({
      where: {
        date: today,
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
            agenda: true,
            signatureUrl: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!dailyLog) {
      return Response.json({
        success: true,
        data: {
          id: null,
          date: today.toISOString(),
          status: "ACTIVE",
          totalPeserta: 0,
          terverifikasi: 0,
          pending: 0,
          attendanceRecords: [],
        },
      });
    }

    const terverifikasi = dailyLog.attendanceRecords.filter(
      (r) => r.signatureUrl
    ).length;
    const pending = dailyLog.attendanceRecords.filter(
      (r) => !r.signatureUrl
    ).length;

    return Response.json({
      success: true,
      data: {
        id: dailyLog.id,
        date: dailyLog.date.toISOString(),
        status: dailyLog.status,
        totalPeserta: dailyLog.attendanceRecords.length,
        terverifikasi,
        pending,
        attendanceRecords: dailyLog.attendanceRecords.map((record) => ({
          id: record.id,
          nama: record.nama,
          nip: record.nip,
          agenda: record.agenda,
          signatureUrl: record.signatureUrl,
          createdAt:
            record.createdAt instanceof Date
              ? record.createdAt.toISOString()
              : record.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return Response.json(
      {
        success: false,
        message: "Gagal fetch statistik absensi",
      },
      { status: 500 }
    );
  }
}

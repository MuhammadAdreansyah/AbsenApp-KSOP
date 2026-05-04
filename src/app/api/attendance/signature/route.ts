// src/app/api/attendance/signature/route.ts
// On-demand endpoint untuk fetch signature URL
// Ini separate dari polling endpoint untuk optimal performance

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/attendance/signature?recordId=xxx
 * Fetch signature URL untuk specific attendance record
 * Digunakan ketika ada kebutuhan untuk display/verify signature
 */
export async function GET(request: NextRequest) {
  try {
    const recordId = request.nextUrl.searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json(
        {
          success: false,
          message: "recordId parameter diperlukan",
        },
        { status: 400 }
      );
    }

    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      select: {
        id: true,
        nama: true,
        signatureUrl: true,
        createdAt: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        nama: record.nama,
        signatureUrl: record.signatureUrl,
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance signature:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal fetch signature",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

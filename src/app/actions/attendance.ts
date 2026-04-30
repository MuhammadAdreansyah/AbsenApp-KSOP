// src/app/actions/attendance.ts
// Server Actions untuk Attendance Form

"use server";

import { prisma } from "@/lib/prisma";
import { AttendanceFormSchema } from "@/lib/validations/attendance";
import { sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

interface AttendanceSubmitResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    createdAt: string;
  };
  errors?: Record<string, string>;
}

/**
 * Submit attendance form
 * - Validates input
 * - Sanitizes fields for XSS protection
 * - Gets or creates today's DailyLog
 * - Saves AttendanceRecord with signature
 */
export async function submitAttendance(
  formData: unknown,
  meetingCode = "default"
): Promise<AttendanceSubmitResult> {
  try {
    // 1. Validate input
    const validatedData = AttendanceFormSchema.parse(formData);

    // 2. Sanitize inputs for XSS protection
    const sanitizedData = {
      nama: sanitizeInput(validatedData.nama),
      nip: validatedData.nip ? sanitizeInput(validatedData.nip) : null,
      agenda: sanitizeInput(validatedData.agenda),
      signature: validatedData.signature,
    };

    // 3. Get or create today's DailyLog
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First check if today's DailyLog exists
    let dailyLog = await prisma.dailyLog.findFirst({
      where: {
        date: today,
      },
    });

    // Create if it doesn't exist
    if (!dailyLog) {
      dailyLog = await prisma.dailyLog.create({
        data: {
          date: today,
          status: "ACTIVE",
        },
      });
    }

    // 4. Save signature as base64 to a temporary location
    // In production, you'd upload to cloud storage (S3, Cloudinary, etc)
    // For now, we'll store it in the database as the signatureUrl
    const signatureUrl = sanitizedData.signature;

    // 5. Create AttendanceRecord
    const record = await prisma.attendanceRecord.create({
      data: {
        nama: sanitizedData.nama,
        nip: sanitizedData.nip,
        agenda: sanitizedData.agenda,
        meetingCode: sanitizeInput(meetingCode),
        signatureUrl: signatureUrl,
        dailyLogId: dailyLog.id,
      },
    });

    logger.info(
      { recordId: record.id, meetingCode, nama: sanitizedData.nama },
      "Attendance submitted successfully"
    );

    return {
      success: true,
      message: "✓ Absensi berhasil disimpan!",
      data: {
        id: record.id,
        createdAt: record.createdAt.toISOString(),
      },
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      const formErrors = error.flatten().fieldErrors;
      logger.warn({ errors: formErrors }, "Attendance validation failed");
      return {
        success: false,
        message: "Validasi gagal. Silakan cek kembali data Anda.",
        errors: Object.fromEntries(
          Object.entries(formErrors).map(([key, messages]) => [
            key,
            Array.isArray(messages) ? messages.join(", ") : "Invalid",
          ])
        ),
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2000") {
        logger.warn({ error: error.message }, "Attendance field too long");
        return {
          success: false,
          message: "Data terlalu panjang. Pastikan field Jabatan/NIP tidak lebih dari 50 karakter.",
        };
      }

      if (error.code === "P2021") {
        logger.error({ error: error.message }, "Database schema not ready");
        return {
          success: false,
          message: "Struktur database belum siap (tabel absensi belum ada). Jalankan `npm run prisma:push` lalu coba simpan kembali.",
        };
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      logger.error({ error: error.message }, "Database connection error");
      return {
        success: false,
        message: "Koneksi database bermasalah. Jalankan ulang server aplikasi lalu coba simpan kembali.",
      };
    }

    // Handle database errors
    logger.error({ error }, "Error submitting attendance");
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
    };
  }
}

/**
 * Get today's attendance records
 */
export async function getTodayAttendance(meetingCode = "default") {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyLog = await prisma.dailyLog.findFirst({
      where: {
        date: today,
      },
      include: {
        attendanceRecords: {
          where: {
            meetingCode,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Convert Date objects to ISO strings for JSON serialization
    const serializedDailyLog = dailyLog ? {
      id: dailyLog.id,
      date: dailyLog.date instanceof Date ? dailyLog.date.toISOString() : dailyLog.date,
      status: dailyLog.status,
      pdfUrl: dailyLog.pdfUrl,
      monthlyArchiveId: dailyLog.monthlyArchiveId,
      attendanceRecords: dailyLog.attendanceRecords.map(record => ({
        id: record.id,
        nama: record.nama,
        nip: record.nip,
        agenda: record.agenda,
        meetingCode: record.meetingCode,
        signatureUrl: record.signatureUrl,
        createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
        dailyLogId: record.dailyLogId,
      })),
    } : null;

    return {
      success: true,
      data: serializedDailyLog,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ error: errorMessage }, "Error fetching today's attendance");
    
    // Return success: true with null data to avoid "Failed to fetch" errors
    // Component will show "Belum ada peserta" message
    return {
      success: true,
      data: null,
    };
  }
}

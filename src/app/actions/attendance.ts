// src/app/actions/attendance.ts
// Server Actions untuk Attendance Form

"use server";

import { prisma } from "@/lib/prisma";
import { AttendanceFormSchema } from "@/lib/validations/attendance";
import { sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";
import { getSupabaseAdminClient, getSupabasePdfBucketName } from "@/lib/supabase-server";
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
      jabatan: validatedData.jabatan ? sanitizeInput(validatedData.jabatan) : null,
      agenda: sanitizeInput(validatedData.agenda),
      signature: validatedData.signature,
    };

    // 3. Get or create today's DailyLog with timezone-aware date range
    const today = new Date();
    // Create local midnight date untuk query/comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // PENTING: Use upsert to avoid race condition
    // If another request creates DailyLog simultaneously, upsert handles it
    const utcYear = today.getUTCFullYear();
    const utcMonth = today.getUTCMonth();
    const utcDay = today.getUTCDate();
    const utcMidnight = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0, 0));

    let dailyLog = await prisma.dailyLog.upsert({
      where: {
        date: utcMidnight,
      },
      update: {
        // If exists, just update status (in case it was FROZEN)
        status: "ACTIVE",
      },
      create: {
        date: utcMidnight,
        status: "ACTIVE",
      },
    });

    // 4. Upload signature ke Supabase Storage (bukan simpan di database)
    // PENTING: Ini fix untuk real-time delay - eliminate base64 dari database
    let signatureUrl = sanitizedData.signature; // Default: fallback to base64
    const supabaseClient = getSupabaseAdminClient();
    
    if (supabaseClient && sanitizedData.signature) {
      try {
        // Generate unique filename dengan timestamp
        const timestamp = Date.now();
        const sanitizedNama = sanitizedData.nama
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 30);
        const fileName = `${timestamp}-${sanitizedNama}.png`;
        const storagePath = `signatures/${dailyLog.date.getFullYear()}/${String(dailyLog.date.getMonth() + 1).padStart(2, '0')}/${fileName}`;
        
        // Convert base64 data URL ke Buffer
        const base64Data = sanitizedData.signature.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Use correct bucket name from config
        const bucketName = getSupabasePdfBucketName();
        
        // Upload ke Supabase
        const uploadResult = await supabaseClient.storage
          .from(bucketName)
          .upload(storagePath, buffer, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false,
          });
        
        if (uploadResult.error) {
          logger.warn(
            { error: uploadResult.error, meetingCode, nama: sanitizedData.nama },
            "Signature upload ke Supabase failed, fallback ke database"
          );
          // Fallback: simpan ke database jika upload gagal
          signatureUrl = sanitizedData.signature;
        } else {
          // Get public URL
          const publicUrlResult = supabaseClient.storage
            .from(bucketName)
            .getPublicUrl(storagePath);
          
          signatureUrl = publicUrlResult.data.publicUrl;
          logger.info(
            { storagePath, meetingCode, nama: sanitizedData.nama },
            "Signature uploaded to Supabase Storage"
          );
        }
      } catch (uploadErr) {
        logger.warn(
          { error: uploadErr, meetingCode, nama: sanitizedData.nama },
          "Signature upload exception, fallback ke database"
        );
        // Fallback: simpan ke database jika exception
        signatureUrl = sanitizedData.signature;
      }
    } else {
      // Fallback untuk local development tanpa Supabase
      logger.info(
        { hasClient: !!supabaseClient, hasSignature: !!sanitizedData.signature },
        "Using fallback signature storage (base64 in database)"
      );
      signatureUrl = sanitizedData.signature;
    }

    // 5. Create AttendanceRecord dengan signature URL (bukan base64)
    const createData: any = {
      nama: sanitizedData.nama,
      nip: sanitizedData.nip,
      // jabatan: sanitizedData.jabatan, // TODO: Uncomment after migration
      agenda: sanitizedData.agenda,
      meetingCode: sanitizeInput(meetingCode),
      signatureUrl: signatureUrl,
      dailyLogId: dailyLog.id,
    };
    
    const record = await prisma.attendanceRecord.create({
      data: createData,
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

      if (error.code === "P2002") {
        logger.warn({ error: error.message }, "Unique constraint violation");
        return {
          success: false,
          message: "Data sudah ada atau terjadi konflik. Silakan refresh halaman dan coba lagi.",
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
    // Use UTC midnight (PENTING: match dengan attendance submission logic)
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

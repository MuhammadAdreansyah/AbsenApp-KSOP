// src/lib/pdf/generator.ts
// PDF Generation Utility untuk Daily Recap

import { renderToFile } from "@react-pdf/renderer";
import DailyRecapPDF from "./templates";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";
import { pathToFileURL } from "url";

interface GeneratePDFOptions {
  date?: Date;
  dailyLogId?: string;
  meetingCode?: string;
  letterheadImageUrl?: string;
  institutionName?: string;
  meetingPlace?: string;
  meetingTitle?: string;
  outputDir?: string;
}

/**
 * Generate Daily Recap PDF
 * - Fetch attendance records for date
 * - Create PDF dengan letterhead
 * - Save to filesystem
 * - Return file path
 */
export async function generateDailyRecapPDF(
  options: GeneratePDFOptions
): Promise<{
  success: boolean;
  message: string;
  filePath?: string;
  error?: string;
}> {
  try {
    const {
      date,
      dailyLogId,
      meetingCode,
      letterheadImageUrl,
      institutionName,
      meetingPlace,
      meetingTitle,
      outputDir,
    } = options;
    const defaultLogoPath = path.join(process.cwd(), "public", "assets", "image", "logo.png");

    let resolvedLetterheadImageUrl = letterheadImageUrl;
    if (resolvedLetterheadImageUrl?.startsWith("/")) {
      const absoluteFromPublic = path.join(process.cwd(), "public", resolvedLetterheadImageUrl);
      try {
        await fs.access(absoluteFromPublic);
        resolvedLetterheadImageUrl = pathToFileURL(absoluteFromPublic).href;
      } catch {
        resolvedLetterheadImageUrl = undefined;
      }
    }

    if (resolvedLetterheadImageUrl && !/^https?:\/\//i.test(resolvedLetterheadImageUrl) && !resolvedLetterheadImageUrl.startsWith("file://")) {
      try {
        await fs.access(resolvedLetterheadImageUrl);
        resolvedLetterheadImageUrl = pathToFileURL(resolvedLetterheadImageUrl).href;
      } catch {
        resolvedLetterheadImageUrl = undefined;
      }
    }

    if (!resolvedLetterheadImageUrl) {
      try {
        await fs.access(defaultLogoPath);
        resolvedLetterheadImageUrl = pathToFileURL(defaultLogoPath).href;
      } catch {
        resolvedLetterheadImageUrl = undefined;
      }
    }

    if (!dailyLogId && !date) {
      return {
        success: false,
        message: "Parameter dailyLogId atau date harus disediakan",
      };
    }

    const includeRecords = {
      attendanceRecords: {
        where: meetingCode
          ? {
              meetingCode,
            }
          : undefined,
        orderBy: { createdAt: "asc" as const },
      },
    };

    let dailyLog = null;

    if (dailyLogId) {
      dailyLog = await prisma.dailyLog.findUnique({
        where: { id: dailyLogId },
        include: includeRecords,
      });
    } else {
      const targetDate = new Date(date as Date);
      const utcYear = targetDate.getUTCFullYear();
      const utcMonth = targetDate.getUTCMonth();
      const utcDay = targetDate.getUTCDate();

      const startUtc = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0, 0));
      const endUtc = new Date(Date.UTC(utcYear, utcMonth, utcDay + 1, 0, 0, 0, 0));

      dailyLog = await prisma.dailyLog.findFirst({
        where: {
          date: {
            gte: startUtc,
            lt: endUtc,
          },
        },
        include: includeRecords,
      });
    }

    if (!dailyLog) {
      return {
        success: false,
        message: "Tidak ada data absensi untuk tanggal ini",
      };
    }

    if (dailyLog.attendanceRecords.length === 0) {
      return {
        success: false,
        message: "Tidak ada peserta yang hadir pada tanggal ini",
      };
    }

    // 2. Create PDF document
    const recapDate = dailyLog.date;

    const pdfDocument = (
      <DailyRecapPDF
        letterheadImageUrl={resolvedLetterheadImageUrl}
        date={recapDate}
        records={dailyLog.attendanceRecords}
        institutionName={institutionName}
        meetingPlace={meetingPlace}
        meetingTitle={meetingTitle}
      />
    );

    // 3. Setup output directory
    const pdfDir =
      outputDir || path.join(process.cwd(), "public", "pdfs", "daily");

    // Create directory if not exists
    try {
      await fs.mkdir(pdfDir, { recursive: true });
    } catch (err) {
      console.warn("Directory creation warning:", err);
    }

    // 4. Generate filename
    const utcYear = recapDate.getUTCFullYear();
    const utcMonth = String(recapDate.getUTCMonth() + 1).padStart(2, "0");
    const utcDay = String(recapDate.getUTCDate()).padStart(2, "0");
    const dateStr = `${utcYear}-${utcMonth}-${utcDay}`;
    const safeMeetingCode = (meetingCode || "default")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "default";
    const fileName = `absensi-harian-${dateStr}-${safeMeetingCode}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // 5. Render and save PDF
    await renderToFile(pdfDocument, filePath);

    // 6. Save pdfUrl to DailyLog
    const pdfUrl = `/pdfs/daily/${fileName}`;
    await prisma.dailyLog.update({
      where: { id: dailyLog.id },
      data: { pdfUrl },
    });

    return {
      success: true,
      message: "PDF berhasil dihasilkan",
      filePath: pdfUrl,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      message: "Gagal menghasilkan PDF",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get PDF URL for a specific date
 */
export async function getDailyRecapPdfUrl(date: Date): Promise<string | null> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const dailyLog = await prisma.dailyLog.findUnique({
      where: { date: startOfDay },
      select: { pdfUrl: true },
    });

    return dailyLog?.pdfUrl || null;
  } catch (error) {
    console.error("Error getting PDF URL:", error);
    return null;
  }
}

/**
 * Regenerate PDF untuk date tertentu
 */
export async function regenerateDailyRecapPDF(
  date: Date,
  options?: Partial<GeneratePDFOptions>
): Promise<{
  success: boolean;
  message: string;
  filePath?: string;
  error?: string;
}> {
  return generateDailyRecapPDF({
    date,
    ...options,
  });
}

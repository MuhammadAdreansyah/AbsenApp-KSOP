import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/logger";

/**
 * GET /api/backup/status
 * Check database backup status and availability
 */
export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), "backups");

    // Check if backups directory exists
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json(
        {
          status: "no_backups",
          message: "Backup directory tidak ditemukan",
          backupDir,
        },
        { status: 200 }
      );
    }

    // List all backup files
    const files = fs.readdirSync(backupDir);
    const backupFiles = files
      .filter((file) => file.endsWith(".dump") || file.endsWith(".sql"))
      .map((file) => {
        const fullPath = path.join(backupDir, file);
        const stats = fs.statSync(fullPath);
        return {
          name: file,
          size: stats.size,
          sizeHuman: formatBytes(stats.size),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (backupFiles.length === 0) {
      return NextResponse.json(
        {
          status: "no_backups",
          message: "Tidak ada file backup ditemukan",
          backupDir,
        },
        { status: 200 }
      );
    }

    const latestBackup = backupFiles[0];
    const totalSize = backupFiles.reduce((sum, f) => sum + f.size, 0);

    logger.info(
      {
        backupCount: backupFiles.length,
        totalSize: formatBytes(totalSize),
        latestBackup: latestBackup.name,
      },
      "Backup status checked"
    );

    return NextResponse.json(
      {
        status: "healthy",
        backupDir,
        totalBackups: backupFiles.length,
        totalSize: formatBytes(totalSize),
        latestBackup,
        allBackups: backupFiles,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, "Error checking backup status");
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal memeriksa status backup",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

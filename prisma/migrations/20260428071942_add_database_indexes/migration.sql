-- CreateEnum
CREATE TYPE "DailyStatus" AS ENUM ('ACTIVE', 'FROZEN');

-- CreateEnum
CREATE TYPE "ArchiveStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "nip" VARCHAR(50),
    "agenda" TEXT NOT NULL,
    "meetingCode" VARCHAR(120) NOT NULL DEFAULT 'default',
    "signatureUrl" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "DailyStatus" NOT NULL DEFAULT 'ACTIVE',
    "pdfUrl" TEXT,
    "monthlyArchiveId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyArchive" (
    "id" TEXT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,
    "status" "ArchiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "zipUrl" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_attendance_dailylog" ON "AttendanceRecord"("dailyLogId");

-- CreateIndex
CREATE INDEX "idx_attendance_meetingcode" ON "AttendanceRecord"("meetingCode");

-- CreateIndex
CREATE INDEX "idx_attendance_createdat" ON "AttendanceRecord"("createdAt");

-- CreateIndex
CREATE INDEX "idx_attendance_daily_meeting" ON "AttendanceRecord"("dailyLogId", "meetingCode");

-- CreateIndex
CREATE INDEX "idx_attendance_daily_date" ON "AttendanceRecord"("dailyLogId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_dailylog_status" ON "DailyLog"("status");

-- CreateIndex
CREATE INDEX "idx_dailylog_monthlyarchive" ON "DailyLog"("monthlyArchiveId");

-- CreateIndex
CREATE INDEX "idx_dailylog_status_created" ON "DailyLog"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_date_key" ON "DailyLog"("date");

-- CreateIndex
CREATE INDEX "idx_monthlyarchive_status" ON "MonthlyArchive"("status");

-- CreateIndex
CREATE INDEX "idx_monthlyarchive_year_month" ON "MonthlyArchive"("year", "month");

-- CreateIndex
CREATE INDEX "idx_monthlyarchive_status_created" ON "MonthlyArchive"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyArchive_month_year_key" ON "MonthlyArchive"("month", "year");

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_monthlyArchiveId_fkey" FOREIGN KEY ("monthlyArchiveId") REFERENCES "MonthlyArchive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

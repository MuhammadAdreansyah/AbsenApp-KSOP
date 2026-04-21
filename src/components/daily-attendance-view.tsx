// src/components/daily-attendance-view.tsx
// Component untuk display hari ini attendance + PDF download

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayAttendance } from "@/app/actions/attendance";

interface AttendanceRecord {
  id: string;
  nama: string;
  nip?: string | null;
  agenda: string;
  meetingCode?: string;
  signatureUrl: string;
  createdAt: Date | string;
}

interface DailyLog {
  id: string;
  date: Date | string;
  status: string;
  pdfUrl?: string | null;
  attendanceRecords: AttendanceRecord[];
}

interface GeneratePdfResponse {
  success: boolean;
  message?: string;
  filePath?: string;
}

interface DailyAttendanceViewProps {
  meetingCode?: string;
}

export function DailyAttendanceView({ meetingCode = "default" }: DailyAttendanceViewProps) {
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLatestPdf = async (): Promise<GeneratePdfResponse> => {
    if (!dailyLog) {
      return {
        success: false,
        message: "Data absensi hari ini belum tersedia.",
      };
    }

    const response = await fetch("/api/pdf/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyLogId: dailyLog.id,
        institutionName: "Institusi Resmi",
        meetingCode,
      }),
    });

    return (await response.json()) as GeneratePdfResponse;
  };

  // Fetch today's attendance
  useEffect(() => {
    let isMounted = true;

    const fetchData = async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);
        
        const result = await getTodayAttendance(meetingCode);
        
        if (isMounted) {
          if (result.success && result.data) {
            setDailyLog(result.data as DailyLog);
          } else {
            setDailyLog(null);
          }
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        if (isMounted) {
          setError("Gagal memuat data absensi");
          setDailyLog(null);
        }
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    const handleAttendanceUpdated = () => {
      void fetchData(false);
    };

    window.addEventListener("attendance:updated", handleAttendanceUpdated);

    // Refresh setiap 30 detik
    const interval = setInterval(() => {
      void fetchData(false);
    }, 30000);
    
    return () => {
      isMounted = false;
      window.removeEventListener("attendance:updated", handleAttendanceUpdated);
      clearInterval(interval);
    };
  }, []);

  const handleDownloadPDF = () => {
    if (!dailyLog) return;

    setIsGeneratingPDF(true);

    void (async () => {
      try {
        // Selalu generate ulang sebelum download agar isi PDF sinkron dengan data terbaru.
        const data = await generateLatestPdf();

        if (!data.success || !data.filePath) {
          toast.error(data.message || "Gagal menyiapkan PDF terbaru");
          return;
        }

        setDailyLog((prev) => (prev ? { ...prev, pdfUrl: data.filePath ?? null } : prev));

        // Cache-busting query agar browser tidak menampilkan file lama.
        const downloadUrl = `${data.filePath}?v=${Date.now()}`;
        window.open(downloadUrl, "_blank");

        window.dispatchEvent(new Event("attendance:updated"));
      } catch (downloadError) {
        toast.error("Terjadi kesalahan saat menyiapkan PDF");
        console.error(downloadError);
      } finally {
        setIsGeneratingPDF(false);
      }
    })();
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
        <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
          <CardTitle className="text-2xl text-slate-900">Rekap Peserta Rapat</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="flex flex-col items-center justify-center p-12">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-sm font-medium text-gray-600">Memuat data absensi...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden border-red-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
        <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
          <CardTitle className="text-2xl text-slate-900">Rekap Peserta Rapat</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Muat Ulang
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
      <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-slate-900">Rekap Peserta Rapat</CardTitle>
          </div>
          {dailyLog && (
            <div className="text-right">
              <div className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{
                  backgroundColor: dailyLog.status === "FROZEN" ? "#ef4444" : "#0f9d67",
                  color: "white"
                }}
              >
                {dailyLog.status === "FROZEN" ? "Terkunci" : "Aktif"}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {dailyLog && dailyLog.attendanceRecords.length > 0 ? (
          <div className="space-y-6">
            {/* Info Box */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Informasi Peserta</p>
              <p className="mt-2 text-sm text-blue-900/85">
                Total {dailyLog.attendanceRecords.length} peserta hadir, {dailyLog.attendanceRecords.filter((r) => r.signatureUrl).length} sudah melakukan verifikasi tanda tangan digital.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-700">
                    {dailyLog.attendanceRecords.length}
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Total Peserta
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700">
                    {dailyLog.attendanceRecords.filter((r) => r.signatureUrl).length}
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-green-600">
                    Terverifikasi
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-700">
                    {dailyLog.attendanceRecords.filter((r) => !r.signatureUrl).length}
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Pending
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance List */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white">DAFTAR</span>
                Peserta Hadir ({dailyLog.attendanceRecords.length})
              </h3>
              <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
                {dailyLog.attendanceRecords.map((record, idx) => (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="font-bold text-gray-900">{record.nama}</p>
                          {record.signatureUrl && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                              Terverifikasi
                            </span>
                          )}
                          {!record.signatureUrl && (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                              Pending
                            </span>
                          )}
                        </div>
                        {record.nip && (
                          <p className="ml-10 text-xs font-medium text-gray-600">
                            NIP: <span className="font-mono">{record.nip}</span>
                          </p>
                        )}
                        <p className="ml-10 mt-2 text-sm font-medium text-gray-700">
                          Kegiatan: {record.agenda.substring(0, 65)}
                          {record.agenda.length > 60 ? "..." : ""}
                        </p>
                        <p className="ml-8 mt-1 text-xs text-gray-400">
                          {new Date(record.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full flex-1 min-h-12 h-auto px-4 py-3 text-sm leading-tight sm:text-base"
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyiapkan PDF terbaru...
                  </>
                ) : (
                  <>Download Laporan PDF Agenda Ini</>
                )}
              </Button>

              {dailyLog.status === "ACTIVE" && (
                <Button
                  variant="outline"
                  className="w-full flex-1 min-h-12 h-auto px-4 py-3 text-sm leading-tight font-semibold sm:text-base"
                >
                  Selesaikan Rapat
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6 text-6xl">📝</div>
            <p className="mb-3 text-lg font-bold text-gray-700">
              Belum Ada Data Peserta
            </p>
            <p className="mb-6 text-sm text-gray-600">
              Silakan mulai dengan mengisi form absensi di sebelah kiri untuk mencatat kehadiran peserta
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// src/components/daily-attendance-view.tsx
// Component untuk display hari ini attendance + PDF download
// OPTIMISASI: Remove base64 signature from polling, add Supabase Realtime

"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayAttendance } from "@/app/actions/attendance";
import { createClient } from "@supabase/supabase-js";

interface AttendanceRecord {
  id: string;
  nama: string;
  nip?: string | null;
  agenda: string;
  meetingCode?: string;
  createdAt: Date | string;
  // signatureUrl removed - reduce payload size
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

// Initialize Supabase realtime if env vars available
const initSupabaseRealtime = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('[DailyAttendanceView] Supabase env not available, using polling only');
      return null;
    }
    
    return createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.log('[DailyAttendanceView] Supabase client init failed:', err);
    return null;
  }
};

export function DailyAttendanceView({ meetingCode = "default" }: DailyAttendanceViewProps) {
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseClientRef = useRef(initSupabaseRealtime());
  const realtimeSubscriptionRef = useRef<any>(null);

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

  // Fetch today's attendance dengan polling real-time setiap 3 detik
  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchData = async (showLoading = true) => {
      try {
        // Cancel previous request if still pending
        if (abortController) {
          abortController.abort();
        }
        
        // Create new abort controller untuk request ini
        abortController = new AbortController();
        
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);
        
        // Gunakan API endpoint ringan untuk real-time polling
        // OPTIMISASI: Payload sekarang jauh lebih kecil tanpa base64 signature
        const url = `/api/attendance/stats?meetingCode=${encodeURIComponent(meetingCode)}`;
        console.log('[DailyAttendanceView] Fetching from:', url);
        
        const response = await fetch(url, {
          signal: abortController.signal,
        });
        const json = await response.json();
        
        console.log('[DailyAttendanceView] API Response:', json);
        
        if (isMounted) {
          if (json.success && json.data) {
            console.log('[DailyAttendanceView] Setting data with', json.data.attendanceRecords?.length || 0, 'records');
            setDailyLog(json.data as DailyLog);
          } else {
            console.log('[DailyAttendanceView] No data or success=false');
            setDailyLog(null);
          }
        }
      } catch (err) {
        // Ignore AbortError - ini normal saat request di-cancel
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[DailyAttendanceView] Request aborted (previous request replaced)');
          return;
        }
        
        console.error("[DailyAttendanceView] Error fetching attendance:", err);
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

    // Initial fetch
    console.log('[DailyAttendanceView] Component mounted, initial fetch');
    fetchData();

    const handleAttendanceUpdated = () => {
      console.log('[DailyAttendanceView] Event "attendance:updated" received, fetching immediately...');
      void fetchData(false); // Immediate fetch on event
    };

    window.addEventListener("attendance:updated", handleAttendanceUpdated);
    console.log('[DailyAttendanceView] Event listener registered');

    // Setup Supabase Realtime listener untuk instant push updates
    if (supabaseClientRef.current) {
      try {
        console.log('[DailyAttendanceView] Setting up Supabase Realtime listener...');
        
        // Subscribe ke changes di AttendanceRecord table
        const channelName = `attendance-${meetingCode}-${Date.now()}`;
        realtimeSubscriptionRef.current = supabaseClientRef.current
          .channel(channelName, {
            config: {
              broadcast: { self: true },
              presence: { key: meetingCode },
            },
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'AttendanceRecord',
            },
            (payload) => {
              console.log('[DailyAttendanceView] Realtime INSERT event:', payload);
              // Fetch data immediately on new attendance (instant update!)
              void fetchData(false);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'AttendanceRecord',
            },
            (payload) => {
              console.log('[DailyAttendanceView] Realtime UPDATE event:', payload);
              void fetchData(false);
            }
          )
          .subscribe((status) => {
            console.log(`[DailyAttendanceView] Realtime subscription status: ${status}`);
          });
          
        console.log('[DailyAttendanceView] Supabase Realtime listener ready');
      } catch (err) {
        console.warn('[DailyAttendanceView] Supabase Realtime setup failed:', err);
        console.log('[DailyAttendanceView] Falling back to polling only');
      }
    } else {
      console.log('[DailyAttendanceView] Supabase client not available, using polling only');
    }

    // Polling real-time setiap 3 detik sebagai fallback (jika Realtime tidak aktif)
    pollingInterval = setInterval(() => {
      console.log('[DailyAttendanceView] Polling interval triggered (fallback)');
      void fetchData(false);
    }, 3000);
    
    return () => {
      console.log('[DailyAttendanceView] Cleanup: removing listeners and intervals');
      isMounted = false;
      window.removeEventListener("attendance:updated", handleAttendanceUpdated);
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      
      // Cleanup Supabase realtime
      if (realtimeSubscriptionRef.current) {
        try {
          supabaseClientRef.current?.removeChannel(realtimeSubscriptionRef.current);
        } catch (err) {
          console.log('[DailyAttendanceView] Supabase cleanup error:', err);
        }
      }
      
      // Cancel any pending request
      if (abortController) {
        abortController.abort();
      }
    };
  }, [meetingCode]);

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
      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] h-full flex flex-col">
        <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
          <CardTitle className="text-2xl text-slate-900">Rekap Peserta Rapat</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 flex-1 flex items-center justify-center">
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
      <Card className="overflow-hidden border-red-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] h-full flex flex-col">
        <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
          <CardTitle className="text-2xl text-slate-900">Rekap Peserta Rapat</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1">
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
    <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] h-full flex flex-col">
      <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl text-slate-900">Rekap Peserta Rapat</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Monitoring kehadiran real-time dengan update otomatis</p>
          </div>
          {dailyLog && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      dailyLog.status === "FROZEN" ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    {dailyLog.status === "FROZEN" ? "Terkunci" : "Aktif"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col">
        {dailyLog && dailyLog.attendanceRecords.length > 0 ? (
          <div className="flex flex-col gap-6 h-full">
            {/* Stats Section */}
            <div className="space-y-2">
                {/* Main Stats - Inline */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                  {/* Peserta Count */}
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-blue-600">{dailyLog.attendanceRecords.length}</div>
                    <div className="text-xs font-semibold text-slate-600 uppercase">Peserta</div>
                  </div>

                  {/* Time Range */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-amber-600">
                      {dailyLog.attendanceRecords.length > 0
                        ? new Date(dailyLog.attendanceRecords[dailyLog.attendanceRecords.length - 1].createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                    <span className="text-slate-300">−</span>
                    <span className="font-semibold text-violet-600">
                      {dailyLog.attendanceRecords.length > 0
                        ? new Date(dailyLog.attendanceRecords[0].createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                    dailyLog.status === "FROZEN" 
                      ? "bg-red-100 text-red-700" 
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${dailyLog.status === "FROZEN" ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                    {dailyLog.status === "FROZEN" ? "Selesai" : "Berlangsung"}
                  </span>
                </div>

                {/* Additional Info - Horizontal */}
                <div className="flex flex-wrap gap-4 text-xs py-1">
                  {/* Durasi */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-semibold">Durasi:</span>
                    <span className="font-bold text-teal-600">
                      {dailyLog.attendanceRecords.length > 1
                        ? (() => {
                            const firstTime = new Date(dailyLog.attendanceRecords[dailyLog.attendanceRecords.length - 1].createdAt).getTime();
                            const lastTime = new Date(dailyLog.attendanceRecords[0].createdAt).getTime();
                            const minutes = Math.round((lastTime - firstTime) / 60000);
                            const hours = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                          })()
                        : "-"}
                    </span>
                  </div>

                  {/* Frekuensi */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-semibold">Freq:</span>
                    <span className="font-bold text-orange-600">
                      {dailyLog.attendanceRecords.length > 1
                        ? (() => {
                            const firstTime = new Date(dailyLog.attendanceRecords[dailyLog.attendanceRecords.length - 1].createdAt).getTime();
                            const lastTime = new Date(dailyLog.attendanceRecords[0].createdAt).getTime();
                            const minutes = Math.ceil((lastTime - firstTime) / 60000);
                            const freq = (dailyLog.attendanceRecords.length / Math.max(minutes, 1)).toFixed(1);
                            return `${freq}/min`;
                          })()
                        : "-"}
                    </span>
                  </div>

                  {/* Tanggal */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-semibold">Tgl:</span>
                    <span className="font-bold text-indigo-600">
                      {dailyLog.attendanceRecords.length > 0
                        ? new Date(dailyLog.attendanceRecords[0].createdAt).toLocaleDateString("id-ID")
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Attendance List */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">📋</span>
                  Daftar Peserta Hadir
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  {dailyLog.attendanceRecords.length} peserta
                </span>
              </div>
              <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-2">
                {dailyLog.attendanceRecords.map((record, idx) => (
                  <div
                    key={record.id}
                    className="group rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50/50 p-3 transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Number Badge */}
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shadow-sm group-hover:shadow-md">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 truncate">{record.nama}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex-shrink-0">
                            <span>✓</span>
                            <span>Hadir</span>
                          </span>
                        </div>

                        {/* NIP */}
                        {record.nip && (
                          <p className="mt-1 text-xs text-gray-600">
                            <span className="font-semibold">NIP:</span>{" "}
                            <span className="font-mono text-gray-700">{record.nip}</span>
                          </p>
                        )}

                        {/* Agenda */}
                        <p className="mt-1.5 text-sm text-gray-700 leading-snug">
                          <span className="font-semibold text-gray-600">Kegiatan:</span>{" "}
                          <span className="text-gray-700">
                            {record.agenda.substring(0, 65)}
                            {record.agenda.length > 60 ? "..." : ""}
                          </span>
                        </p>

                        {/* Time */}
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <span>🕐</span>
                          <span>
                            {new Date(record.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 mt-2 sm:flex-row">
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
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center py-8">
              <div className="mb-6 text-6xl">📝</div>
              <p className="mb-3 text-lg font-bold text-gray-700">
                Belum Ada Data Peserta
              </p>
              <p className="mb-6 text-sm text-gray-600 max-w-xs">
                Silakan mulai dengan mengisi form absensi di sebelah kiri untuk mencatat kehadiran peserta
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// src/app/dashboard/page.tsx
// Dashboard page - Clean layout dengan form absensi + rekap harian

import { AttendanceForm } from "@/components/attendance-form";
import { DailyAttendanceView } from "@/components/daily-attendance-view";
import { MeetingLinkGenerator } from "@/components/meeting-link-generator";

interface DashboardPageProps {
  searchParams?: Promise<{
    meeting?: string | string[];
  }>;
}

function normalizeMeetingCode(value?: string): string {
  if (!value) return "default";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "default";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawMeeting = Array.isArray(resolvedSearchParams?.meeting)
    ? resolvedSearchParams?.meeting[0]
    : resolvedSearchParams?.meeting;
  const meetingCode = normalizeMeetingCode(rawMeeting);
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500">
                  KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Sistem Manajemen Absensi Rapat
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Direktorat Jenderal Perhubungan Laut • KSOP Utama Belawan
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-2 text-right">
              <p className="text-sm font-semibold text-blue-900">{currentDate}</p>
              <p className="mt-1 text-xs text-blue-700">
                {new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tujuan</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Absensi Rapat</p>
            <p className="mt-1 text-xs text-slate-600">Pencatatan peserta rapat resmi</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lembaga</p>
            <p className="mt-1 text-base font-semibold text-slate-900">KSOP Utama</p>
            <p className="mt-1 text-xs text-slate-600">Direktorat Jenderal Perhubungan Laut</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metode</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Tanda Tangan Digital</p>
            <p className="mt-1 text-xs text-slate-600">Verifikasi elektronik terintegrasi</p>
          </div>
        </div>

        <div className="mt-6">
          <MeetingLinkGenerator currentMeetingCode={meetingCode} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AttendanceForm meetingCode={meetingCode} />
          </div>

          <div className="lg:col-span-2">
            <DailyAttendanceView meetingCode={meetingCode} />
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">Fitur Keamanan</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>Data Terenkripsi</li>
                <li>Backup Otomatis</li>
                <li>Verifikasi Digital</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">Kemampuan Sistem</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>Input Real-time</li>
                <li>Rekap PDF Harian</li>
                <li>Tanda Tangan Digital</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">Organisasi</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>Dir. Jen. Perhubungan Laut</li>
                <li>KSOP Utama Belawan</li>
                <li>Sumatera Utara</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">Informasi</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>Versi 1.0</li>
                <li>Tahun 2026</li>
                <li>Kementerian Perhubungan</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <p className="text-center text-xs text-slate-600">
              © 2026 Sistem Absensi Rapat - Direktorat Jenderal Perhubungan Laut
            </p>
            <p className="mt-2 text-center text-xs text-slate-500">
              Sistem ini dikembangkan untuk meningkatkan efisiensi pencatatan kehadiran peserta rapat dengan teknologi digital terkini
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

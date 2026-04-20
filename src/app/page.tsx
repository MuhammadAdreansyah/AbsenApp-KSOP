import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-80px] h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-100px] h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <section className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              SISTEM ABSENSI TERINTEGRASI
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Absensi Digital
                <br />
                yang Cepat, Jelas, dan Andal
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Solusi kehadiran rapat dengan verifikasi tanda tangan digital,
                rekap otomatis, dan output laporan PDF siap arsip.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Verifikasi</p>
                <p className="mt-1 text-sm text-slate-700">Tanda tangan digital langsung di perangkat</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Laporan</p>
                <p className="mt-1 text-sm text-slate-700">Export PDF harian siap cetak dan distribusi</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="block sm:flex-1">
                <Button className="w-full">Masuk ke Dashboard</Button>
              </Link>
              <button className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-1">
                Tentang Sistem
              </button>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Ringkasan Fitur</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Input Kehadiran Real-time</p>
                <p className="mt-1 text-sm text-slate-600">Data peserta tercatat langsung setelah form disubmit.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Rekap Harian Otomatis</p>
                <p className="mt-1 text-sm text-slate-600">Daftar peserta dan status verifikasi selalu terbarui.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Arsip PDF</p>
                <p className="mt-1 text-sm text-slate-600">Laporan dapat dibuat dan diunduh untuk kebutuhan administrasi.</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Didukung Next.js, Prisma, dan PostgreSQL untuk performa stabil.
            </p>
          </aside>
        </section>
      </main>

      <footer className="relative mx-auto mt-6 max-w-6xl border-t border-slate-200 pt-4 text-xs text-slate-500">
        <p>© 2026 Sistem Informasi Institusi</p>
      </footer>
    </div>
  );
}

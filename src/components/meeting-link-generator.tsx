"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MeetingLinkGeneratorProps {
  currentMeetingCode: string;
}

function normalizeMeetingCode(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function buildAutoMeetingCode(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  return `rapat-${yyyy}${mm}${dd}-${hh}${min}${sec}`;
}

export function MeetingLinkGenerator({ currentMeetingCode }: MeetingLinkGeneratorProps) {
  const [meetingInput, setMeetingInput] = useState("");

  const nextMeetingCode = useMemo(() => {
    const normalized = normalizeMeetingCode(meetingInput);
    return normalized || "";
  }, [meetingInput]);

  const currentLink = useMemo(() => {
    if (typeof window === "undefined") {
      return `/dashboard?meeting=${encodeURIComponent(currentMeetingCode)}`;
    }

    return `${window.location.origin}/dashboard?meeting=${encodeURIComponent(currentMeetingCode)}`;
  }, [currentMeetingCode]);

  const nextLink = useMemo(() => {
    if (!nextMeetingCode) return "";

    if (typeof window === "undefined") {
      return `/dashboard?meeting=${encodeURIComponent(nextMeetingCode)}`;
    }

    return `${window.location.origin}/dashboard?meeting=${encodeURIComponent(nextMeetingCode)}`;
  }, [nextMeetingCode]);

  const handleCopy = async (value: string, successMessage: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Gagal menyalin link. Silakan copy manual dari kolom.");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generator Link Rapat</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Pisahkan Absensi Antar Agenda</h2>
          <p className="mt-1 text-xs text-slate-600">
            Setiap kode rapat menghasilkan data absensi dan PDF yang berbeda walau di hari yang sama.
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          Aktif: {currentMeetingCode}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold text-slate-500">Link rapat aktif</p>
          <Input
            className="mt-2 bg-white text-xs sm:text-sm"
            value={currentLink}
            readOnly
          />
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => handleCopy(currentLink, "Link rapat aktif berhasil disalin")}
          >
            Salin Link Aktif
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-slate-500">Buat link rapat baru</p>
            <span className="rounded-full border border-amber-400 bg-amber-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-900">
              Gunakan ini jika ada agenda rapat terbaru
            </span>
          </div>
          <Input
            className="mt-2 bg-white"
            placeholder="Contoh: Rapat Evaluasi Triwulan"
            value={meetingInput}
            onChange={(event) => setMeetingInput(event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-600">
            Kode hasil: <span className="font-semibold text-slate-800">{nextMeetingCode || "-"}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMeetingInput(buildAutoMeetingCode())}
            >
              Generate Otomatis
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!nextLink}
              onClick={() => {
                if (!nextLink) return;
                window.open(nextLink, "_blank", "noopener,noreferrer");
              }}
            >
              Buka di Tab Baru
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!nextLink}
              onClick={() => handleCopy(nextLink, "Link rapat baru berhasil disalin")}
            >
              Salin Link Baru
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

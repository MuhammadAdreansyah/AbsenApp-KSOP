// src/components/attendance-form.tsx
// Attendance Form Component

"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AttendanceFormSchema, AttendanceFormInput } from "@/lib/validations/attendance";
import { submitAttendance } from "@/app/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad } from "@/components/signature-pad";

interface AttendanceFormProps {
  meetingCode?: string;
}

export function AttendanceForm({ meetingCode = "default" }: AttendanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signatureResetSignal, setSignatureResetSignal] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AttendanceFormInput>({
    resolver: zodResolver(AttendanceFormSchema),
    mode: "onChange",
    defaultValues: {
      nama: "",
      nip: "",
      agenda: "",
      signature: "",
    },
  });

  // Watch signature field to track changes
  const signatureValue = watch("signature");

  const clearForm = () => {
    reset();
    setSignatureResetSignal((prev) => prev + 1);
  };

  const handleSignatureChange = useCallback(
    (sig: string) => {
      setValue("signature", sig, { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (data: AttendanceFormInput) => {
    if (isLoading) return;

    // Validate signature exists before submit
    if (!data.signature || data.signature.length < 100) {
      toast.error("Signature tidak valid - silakan tandatangani terlebih dahulu");
      return;
    }

    setIsLoading(true);

    try {
      const result = await submitAttendance(data, meetingCode);

      if (result.success) {
        toast.success(result.message);
        clearForm();
        window.dispatchEvent(new Event("attendance:updated"));
      } else {
        toast.error(result.message);
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, message]) => {
            toast.error(`${field}: ${message}`);
          });
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan tak terduga");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] h-full flex flex-col">
      <CardHeader className="rounded-t-2xl border-b border-slate-200 bg-white">
        <CardTitle className="text-2xl flex items-center gap-2 text-slate-900">
          Form Absensi Rapat
        </CardTitle>
        <p className="mt-1 text-sm text-slate-600">
          Isi data peserta, tambahkan tanda tangan, lalu simpan absensi.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <CardContent className="space-y-5 pt-6 flex-1">
          {/* Header Info */}
          <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Petunjuk Pengisian</p>
            <p className="mt-2 text-sm text-blue-900/90">
              Anda sedang mengisi absensi untuk agenda: <span className="font-semibold">{meetingCode}</span>. Isi nama dan topik rapat, lalu tandatangani sebelum menekan tombol simpan.
            </p>
            <p className="mt-2 text-xs font-semibold text-blue-700">
              Field bertanda <span className="text-red-500">*</span> wajib diisi.
            </p>
          </div>

          {/* Nama Field */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-semibold text-gray-900">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama"
              placeholder="Cth: Budi Santoso"
              className="bg-white"
              {...register("nama")}
              error={errors.nama?.message}
            />
            {errors.nama && (
              <p className="text-xs text-red-500 font-medium">{errors.nama.message}</p>
            )}
          </div>

          {/* NIP Field */}
          <div className="space-y-2">
            <Label htmlFor="nip" className="text-sm font-semibold text-gray-900">
              Jabatan / Posisi <span className="text-gray-400 font-normal">(Opsional)</span>
            </Label>
            <Input
              id="nip"
              placeholder="Cth: Manager, Supervisor, Staff"
              className="bg-white"
              maxLength={50}
              {...register("nip")}
              error={errors.nip?.message}
            />
            {errors.nip && (
              <p className="text-xs text-red-500 font-medium">{errors.nip.message}</p>
            )}
          </div>

          {/* Agenda Field */}
          <div className="space-y-2">
            <Label htmlFor="agenda" className="text-sm font-semibold text-gray-900">
              Nama Rapat / Topik Agenda <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="agenda"
              placeholder="Cth: Rapat Koordinasi Tahunan, Diskusi Strategi Pemasaran, dll..."
              rows={3}
              className="resize-none bg-white"
              {...register("agenda")}
              error={errors.agenda?.message}
            />
            {errors.agenda && (
              <p className="text-xs text-red-500 font-medium">{errors.agenda.message}</p>
            )}
          </div>

          {/* Signature Field */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Tanda Tangan Digital <span className="text-red-500">*</span>
            </Label>
            <p className="mb-2 text-xs text-gray-600">
              Silakan tandatangani di area bawah menggunakan mouse atau stylus
            </p>
            <SignaturePad
              key={signatureResetSignal}
              onSignatureChange={handleSignatureChange}
              error={errors.signature?.message}
            />
            {errors.signature && (
              <p className="text-xs text-red-500 font-medium">{errors.signature.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearForm();
            }}
            disabled={isLoading}
            className="w-full min-h-12 sm:w-auto sm:flex-1"
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !signatureValue}
            className="w-full min-h-12 sm:flex-[1.2]"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"
                  />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>Simpan Absensi</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

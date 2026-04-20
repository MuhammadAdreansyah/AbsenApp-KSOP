// src/lib/validations/attendance.ts
// Zod validation schema untuk form attendance

import { z } from "zod";

export const AttendanceFormSchema = z.object({
  nama: z.string().min(3, "Nama harus minimal 3 karakter").max(255, "Nama terlalu panjang"),
  nip: z
    .string()
    .max(50, "Jabatan / NIP maksimal 50 karakter")
    .optional()
    .or(z.literal("")),
  agenda: z.string().min(5, "Agenda harus minimal 5 karakter").max(500, "Agenda terlalu panjang"),
  signature: z
    .string()
    .min(100, "Signature tidak valid - silakan tandatangani")
    .max(10000000, "Signature terlalu besar")
    .refine((val) => val && val.length >= 100, {
      message: "Silakan tandatangani terlebih dahulu",
    }),
});

export type AttendanceFormInput = z.infer<typeof AttendanceFormSchema>;

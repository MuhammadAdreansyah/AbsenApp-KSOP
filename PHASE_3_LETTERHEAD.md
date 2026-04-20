# Letterhead Integration Guide - Phase 3

## Apa itu Letterhead (Kop Surat)?

Letterhead adalah gambar header resmi institusi Anda yang akan ditampilkan di bagian atas setiap laporan PDF absensi harian.

## Setup Letterhead

### Option 1: Local File (Recommended untuk Development)
1. Siapkan gambar letterhead Anda dalam format **PNG** atau **JPG**
2. Ukuran ideal: **Width: 800px, Height: 150-200px**
3. Taruh file di: `public/assets/letterhead.png`
4. Update referensi di API atau parameter

### Option 2: Cloud URL
1. Upload gambar ke cloud storage (Cloudinary, AWS S3, etc)
2. Dapatkan public URL
3. Pass URL saat generate PDF via API

### Option 3: Base64 Embedded
1. Convert gambar ke base64
2. Pass string base64 langsung ke PDF generator

## How to Use

### Via API
```bash
# POST /api/pdf/generate
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-04-16",
    "letterheadImageUrl": "https://example.com/letterhead.png",
    "institutionName": "Institusi Resmi Indonesia"
  }'
```

### Via Dashboard Button
1. Buka http://localhost:3000/dashboard
2. Isi form absensi (minimal 1 peserta)
3. Lihat di sisi kanan: "Buat Laporan PDF"
4. PDF akan include letterhead secara otomatis

## Current Settings

- **Default Institution Name**: "Institusi Resmi"
- **PDF Format**: A4 Landscape (Optional)
- **Table Columns**: No, Nama, NIP, Agenda, Tanda Tangan
- **Footer**: Auto-generated timestamp

## Customization

Untuk mengubah layout atau styling PDF:
1. Edit: `src/lib/pdf/templates.tsx`
2. Modify styles atau add letterhead image
3. Restart dev server

## Troubleshooting

### PDF tidak tergenerate
- Pastikan ada minimal 1 attendance record untuk hari tersebut
- Check `/public/pdfs/daily/` directory exists

### Letterhead tidak muncul
- Verify URL image accessible
- Check console untuk error messages
- Gunakan ukuran image yang sesuai

### Signature tidak tampil di PDF
- Pastikan signatureUrl valid (data URI base64)
- Check browser console untuk error

---

**Next Steps (Phase 4)**: Implementasi Cron Jobs untuk auto-generate PDF setiap 23:59

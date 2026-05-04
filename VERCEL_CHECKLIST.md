# 🚀 Vercel Setup Checklist - Real-time Absensi

Ikuti checklist ini step-by-step untuk mengaktifkan real-time di Vercel.

---

## 📋 FASE 1: Siapkan Credentials Supabase (5 menit)

- [ ] **1. Buka Supabase Dashboard**
  - Alamat: https://app.supabase.com
  - Login dengan akun Anda
  
- [ ] **2. Pilih Project**
  - Klik project yang digunakan untuk AbsenApp
  
- [ ] **3. Buka Settings → API**
  - Lihat panel sebelah kiri: "Settings" → "API"
  
- [ ] **4. Copy 3 Credentials (jangan share!)**
  ```
  A) Project URL
     → Nilai: https://xxxxx.supabase.co
     → Gunakan untuk: NEXT_PUBLIC_SUPABASE_URL
     
  B) anon public
     → Nilai: eyJhbGciOiJIUzI1NiIsInR5cCI6...
     → Gunakan untuk: NEXT_PUBLIC_SUPABASE_ANON_KEY
     
  C) service_role secret
     → Nilai: eyJhbGciOiJIUzI1NiIsInR5cCI6...
     → Gunakan untuk: SUPABASE_SERVICE_ROLE_KEY
  ```

- [ ] **5. Copy Database URLs**
  - Buka tab "Databases"
  - Pool URL → DATABASE_URL
  - Direct URL → DIRECT_URL

---

## 🔐 FASE 2: Setup Vercel Environment Variables (10 menit)

- [ ] **1. Buka Vercel Dashboard**
  - Alamat: https://vercel.com/dashboard
  
- [ ] **2. Pilih Project "absenapp"**
  
- [ ] **3. Klik Settings**
  
- [ ] **4. Pilih "Environment Variables"**

- [ ] **5. Tambahkan 7 variabel berikut** (satu per satu):

### **Variabel 1: DATABASE_URL**
```
Name:  DATABASE_URL
Value: postgresql://postgres.<project-ref>:<password>@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
Environment: Production, Preview, Development (pilih semua)
```
- [ ] Klik "Save"

### **Variabel 2: DIRECT_URL**
```
Name:  DIRECT_URL
Value: postgresql://postgres.<project-ref>:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
Environment: Production, Preview, Development
```
- [ ] Klik "Save"

### **Variabel 3: NEXT_PUBLIC_SUPABASE_URL** ⭐
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: Production, Preview, Development (pilih semua)
```
- [ ] Klik "Save"

### **Variabel 4: NEXT_PUBLIC_SUPABASE_ANON_KEY** ⭐⭐ PALING PENTING!
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6...
Environment: Production, Preview, Development (pilih semua)
```
⚠️ **CRITICAL**: Ini yang membuat Realtime bekerja!
- [ ] Klik "Save"

### **Variabel 5: SUPABASE_SERVICE_ROLE_KEY**
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6...
Environment: Production, Preview (jangan Development)
```
⚠️ Jangan di-Development untuk keamanan
- [ ] Klik "Save"

### **Variabel 6: SUPABASE_PDF_BUCKET**
```
Name:  SUPABASE_PDF_BUCKET
Value: daily-pdfs
Environment: Production, Preview, Development
```
- [ ] Klik "Save"

### **Variabel 7: CRON_SECRET**
```
Name:  CRON_SECRET
Value: (generate secret acak: https://generate.plus/en/random/string)
Environment: Production, Preview
```
- [ ] Klik "Save"

---

## 📦 FASE 3: Setup Supabase Storage (5 menit)

- [ ] **1. Buka Supabase Storage**
  - Klik "Storage" di sidebar Supabase dashboard
  
- [ ] **2. Buat Bucket "daily-pdfs"**
  - Klik "New Bucket"
  - Name: `daily-pdfs`
  - Visibility: Public
  - Klik "Create Bucket"

- [ ] **3. Konfigurasi Policies** (opsional tapi recommended)
  - Pilih bucket `daily-pdfs`
  - Klik "Policies"
  - Edit policies untuk allow service role ke upload

---

## 🔄 FASE 4: Deploy ke Vercel (3 menit)

- [ ] **1. Pastikan kode sudah up-to-date**
  ```bash
  git status
  ```

- [ ] **2. Commit perubahan terbaru** (jika ada)
  ```bash
  git add .
  git commit -m "Fix: Enable Supabase Realtime for production"
  ```

- [ ] **3. Push ke main branch**
  ```bash
  git push origin main
  ```

- [ ] **4. Tunggu Vercel auto-deploy**
  - Buka https://vercel.com/dashboard
  - Lihat deployment progress
  - Tunggu sampai "Ready" (biasanya 2-3 menit)

---

## ✅ FASE 5: Testing (5 menit)

### **Test 1: Basic Polling (harus berhasil)**
- [ ] Buka: https://yourdomain.vercel.app/dashboard
- [ ] Isi form (Nama, NIP, Agenda)
- [ ] Tandatangani
- [ ] Klik "Simpan Absensi"
- [ ] **Verifikasi**: Data muncul di "Rekap Peserta Rapat" dalam 3 detik
- [ ] **Status**: ✅ PASS / ❌ FAIL

### **Test 2: Realtime Push (jika Supabase config benar)**
- [ ] Buka 2 browser tab sama-sama: https://yourdomain.vercel.app/dashboard
- [ ] Di Tab 1: Submit absensi baru
- [ ] **Verifikasi**: Data muncul di Tab 2 dalam <1 detik
- [ ] **Status**: ✅ PASS / ❌ FAIL (OK jika hanya polling)

### **Test 3: Console Check**
- [ ] Buka browser: https://yourdomain.vercel.app/dashboard
- [ ] Tekan F12 (buka DevTools)
- [ ] Klik tab "Console"
- [ ] Lihat log yang muncul:

```javascript
// JIKA REALTIME AKTIF (✅ sempurna):
[DailyAttendanceView] Setting up Supabase Realtime listener...
[DailyAttendanceView] Supabase Realtime listener ready

// JIKA HANYA POLLING (⚠️ fallback):
[DailyAttendanceView] Supabase env not available, using polling only
```

- [ ] **Status**: Realtime ✅ / Polling only ⚠️

### **Test 4: PDF Download**
- [ ] Pastikan ada minimal 1 data peserta
- [ ] Klik "Download Laporan PDF Agenda Ini"
- [ ] **Verifikasi**: PDF download berhasil
- [ ] **Status**: ✅ PASS / ❌ FAIL

---

## 🐛 Troubleshooting

### **Masalah A: "Data tidak muncul sama sekali"**
```
Error di console: Network error / 500 error
Solusi:
  1. Cek: DATABASE_URL dan DIRECT_URL di Vercel
  2. Cek: Prisma migrations sudah berjalan
  3. Action: Delete environment var dan re-add
```
- [ ] Fixed

### **Masalah B: "Hanya polling, Realtime tidak jalan"**
```
Console: "Supabase env not available, using polling only"
Solusi:
  1. Cek: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ada di Vercel
  2. HARUS NEXT_PUBLIC_ prefix agar browser bisa akses
  3. Action: Re-deploy setelah add env vars
```
- [ ] Fixed

### **Masalah C: "PDF upload gagal"**
```
Error: "Gagal upload PDF ke Supabase Storage"
Solusi:
  1. Cek: SUPABASE_SERVICE_ROLE_KEY ada di Vercel
  2. Cek: Bucket "daily-pdfs" sudah dibuat di Supabase
  3. Cek: Storage policies configure dengan benar
```
- [ ] Fixed

### **Masalah D: "Polling sangat lambat (>10 detik)"**
```
Penyebab: Cold start Vercel atau database pooler issue
Solusi:
  1. Tunggu 1 menit (cold start normal)
  2. Buka https://yourdomain.vercel.app/api/health
  3. Cek response time di DevTools Network tab
```
- [ ] Fixed

---

## 📊 Verifikasi Final

Jika semua test pass, hubungi user dengan info:

```
✅ PRODUCTION READY

Real-time Mode: [Realtime + Polling] atau [Polling only]
Latency: <3 sec
PDF: ✓ Working
Health Check: OK

Deployment: https://yourdomain.vercel.app
Dashboard: https://yourdomain.vercel.app/dashboard
```

---

## 🎯 Performance Monitoring

Pantau metrics ini di Vercel Dashboard:

- **Build Time**: < 3 menit
- **Cold Start**: < 2 detik
- **API Response**: < 100ms
- **Error Rate**: < 0.1%

---

## 📞 Jika Masih Ada Masalah

1. **Buka Vercel Logs**: https://vercel.com/dashboard → Project → Logs
2. **Check Console**: F12 → Console tab
3. **Check Status**: https://status.supabase.com (cek Supabase uptime)
4. **Review Setup**: Baca VERCEL_SETUP.md untuk detail lengkap

---

**Tanggal Setup**: _______________  
**Versi Aplikasi**: 1.0.0  
**Environment**: Production  
**Status**: ✅ Completed / ⏳ In Progress / ❌ Failed

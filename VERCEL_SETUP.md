# Setup Real-time untuk Vercel Production

Panduan lengkap untuk mengkonfigurasi sistem absensi agar real-time berfungsi optimal di Vercel.

---

## 🚀 Ringkasan Masalah

Di **lokal development**, sistem fallback ke **polling (3 detik)** karena `NEXT_PUBLIC_SUPABASE_ANON_KEY` belum dikonfigurasi.

Di **Vercel production**, sistem memerlukan konfigurasi penuh untuk mengaktifkan **Supabase Realtime (instant push)** dengan **polling fallback**.

---

## ⚙️ Environment Variables yang Dibutuhkan

Tambahkan semua variabel berikut di **Vercel Project Settings > Environment Variables**:

### **Database (REQUIRED)**
```env
# Pooler URL untuk Serverless (Vercel)
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require

# Direct URL untuk Prisma migrations
DIRECT_URL=postgresql://postgres.<project-ref>:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

### **Supabase - Realtime & Storage (REQUIRED)**
```env
# URL Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co

# Anon key UNTUK REALTIME DI BROWSER (paling penting!)
# ⚠️ Ini harus PUBLIC untuk Realtime bekerja
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (JANGAN PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Nama bucket untuk PDF storage
SUPABASE_PDF_BUCKET=daily-pdfs
```

### **Optional - Branding**
```env
NEXT_PUBLIC_LETTERHEAD_URL=https://yourdomain.com/assets/image/logo.png
```

### **Security**
```env
CRON_SECRET=ganti-dengan-secret-acak-yang-kuat-minimal-32-char
```

---

## 📋 Step-by-Step Setup Vercel

### **1️⃣ Dapatkan Credentials dari Supabase**

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik **Settings** → **API**
4. Salin nilai berikut:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **PENTING**: 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` dimulai dengan `NEXT_PUBLIC_` = **SAFE PUBLIC**
- `SUPABASE_SERVICE_ROLE_KEY` = **JANGAN PERNAH PUBLIC**

### **2️⃣ Setup Vercel Environment Variables**

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project `absenapp`
3. Klik **Settings** → **Environment Variables**
4. Tambahkan semua variabel di atas
5. Pilih environment: **Production** (dan Development jika perlu)
6. Klik **Save**

### **3️⃣ Setup Supabase Storage untuk PDF**

1. Di Supabase dashboard, buka **Storage**
2. Buat bucket baru: **daily-pdfs**
3. Set policies:
   ```sql
   -- Authenticated users bisa membaca
   SELECT * WHERE true
   
   -- Service role bisa write
   INSERT * WHERE true
   UPDATE * WHERE true
   DELETE * WHERE true
   ```

### **4️⃣ Deploy ke Vercel**

1. Push ke GitHub branch `main`:
   ```bash
   git add .
   git commit -m "Fix: Add Supabase Realtime environment variables for Vercel"
   git push origin main
   ```
2. Vercel otomatis deploy
3. Tunggu build selesai

---

## ✅ Testing Real-time di Vercel

### **Test 1: Polling Fallback (pasti jalan)**
```
Buka: https://yourdomain.vercel.app/dashboard
Submit absensi
Tunggu max 3 detik
✓ Data harus muncul di "Rekap Peserta Rapat"
```

### **Test 2: Realtime Push (jika Supabase env benar)**
```
Buka browser 1: https://yourdomain.vercel.app/dashboard
Buka browser 2: https://yourdomain.vercel.app/dashboard
Di browser 1: Submit absensi
✓ Data harus muncul di browser 2 dalam <1 detik (push)
```

### **Test 3: Multi-tab Sync**
```
Tab 1 & Tab 2: Sama-sama buka /dashboard
Tab 1: Submit absensi
✓ Tab 2 harus langsung ter-update <1 detik
```

### **Browser Console Check**
```javascript
// Di Vercel, Anda harus lihat ini:
[DailyAttendanceView] Setting up Supabase Realtime listener...
[DailyAttendanceView] Supabase Realtime listener ready

// Bukan ini:
[DailyAttendanceView] Supabase env not available, using polling only
```

---

## 🔍 Troubleshooting

### **Masalah: Data tidak muncul sama sekali**
```
❌ GET /api/attendance/stats 500 error?
→ Cek: DATABASE_URL dan DIRECT_URL di Vercel
→ Cek: Prisma migrations sudah berjalan
```

### **Masalah: Hanya polling yang jalan, Realtime tidak**
```
❌ Console: "Supabase env not available"
→ Cek: NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel
→ Versi: Harus dengan NEXT_PUBLIC_ prefix agar browser bisa akses
```

### **Masalah: PDF upload gagal**
```
❌ "Gagal upload PDF ke Supabase Storage"
→ Cek: SUPABASE_SERVICE_ROLE_KEY di Vercel
→ Cek: Bucket "daily-pdfs" sudah dibuat di Supabase
→ Cek: Storage policies sudah dikonfigurasi
```

### **Masalah: Polling sangat lambat (>5 detik)**
```
❌ Respons API lambat
→ Cek: DATABASE_URL menggunakan pooler URL (bukan direct)
→ Cek: Query API `/api/attendance/stats` optimization
→ Vercel logs: Check cold start duration
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                        │
├─────────────────────────────────────────────────────────────────┤
│ Supabase Realtime Listener (IF NEXT_PUBLIC_SUPABASE_ANON_KEY)   │
│  ↓                                                              │
│ [INSERT event] → Fetch immediately (instant ~100ms)            │
│                                                                 │
│ Fallback Polling (setiap 3 detik)                              │
│  ↓                                                              │
│ GET /api/attendance/stats?meetingCode=...                      │
└─────────────────────────────────────────────────────────────────┘
        ↓                              ↓
   SUPABASE                      VERCEL API
   Realtime DB                   (Next.js Edge)
   (Push)                        (Polling)
        ↓                              ↓
┌───────────────────────────────────────────────────────────┐
│              PostgreSQL @ Supabase                        │
│  - AttendanceRecord table                                │
│  - DailyLog table                                        │
│  - Realtime postgres_changes subscription                │
└───────────────────────────────────────────────────────────┘
```

---

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| **Realtime Push** | <1 sec | ✅ (if Supabase env OK) |
| **Polling Fallback** | ~3 sec | ✅ (always works) |
| **API Response** | <100ms | ✅ (pooler optimized) |
| **PDF Generation** | <5 sec | ✅ (depends on data) |
| **Cold Start** | <3 sec | ✅ (Vercel serverless) |

---

## 🔒 Security Checklist

- ✅ `NEXT_PUBLIC_*` variables hanya value yang aman public
- ✅ `SUPABASE_SERVICE_ROLE_KEY` TIDAK di-expose ke browser
- ✅ `CRON_SECRET` di-set di-header untuk cron endpoint
- ✅ Database pooler untuk connection limit
- ✅ HTTPS only (Vercel default)
- ✅ CORS configured di Supabase

---

## 📞 Support Resources

- **Supabase Realtime Docs**: https://supabase.com/docs/guides/realtime
- **Supabase Configuration**: https://app.supabase.com/project/_/settings/api
- **Vercel Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Next.js Secrets Management**: https://nextjs.org/docs/app/building-your-application/deploying/production-checklist

---

## 📝 Checklist Deployment

- [ ] Semua environment variables sudah di-Vercel
- [ ] DATABASE_URL gunakan pooler URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY sudah di-set (paling penting!)
- [ ] SUPABASE_SERVICE_ROLE_KEY sudah di-set
- [ ] Supabase Storage bucket "daily-pdfs" sudah dibuat
- [ ] Storage policies sudah dikonfigurasi
- [ ] Testing polling berfungsi ✓
- [ ] Testing realtime push berfungsi ✓
- [ ] Cron jobs running (check `/api/health`)
- [ ] PDF download working
- [ ] Mobile responsive tested

---

Jika masih ada masalah setelah setup, cek console browser (F12) untuk error logs dan vercel.com/logs untuk server logs.

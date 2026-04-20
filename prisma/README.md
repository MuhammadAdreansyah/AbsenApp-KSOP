# AbsenApp - Panduan Operasional Prisma Database

Dokumentasi ini fokus ke perintah Prisma untuk pengelolaan database harian.
Tujuannya agar saat ada kendala teknis Anda bisa langsung jalankan perintah yang tepat.

## Prasyarat

1. Pastikan file `.env` / `.env.local` sudah berisi `DATABASE_URL` yang benar.
2. Jalankan perintah dari root project: `D:\absenapp`.
3. Gunakan Node.js sesuai project.

## Script Prisma yang Tersedia

Perintah berikut sudah ada di `package.json`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:push
npm run prisma:studio
```

## Alur Normal Setelah Ubah Schema

Jika Anda mengubah `prisma/schema.prisma`, jalankan:

```bash
# 1) Generate ulang Prisma Client
npm run prisma:generate

# 2A) Untuk development dengan riwayat migration
npm run prisma:migrate

# 2B) Alternatif cepat sinkron schema (tanpa migration file)
npm run prisma:push
```

Catatan:
- `prisma:migrate` dipakai saat ingin perubahan schema terdokumentasi sebagai migration.
- `prisma:push` dipakai saat butuh cepat sinkron schema ke DB.

## Operasional Harian Database

### 1. Cek data via UI (paling aman)

```bash
npm run prisma:studio
```

Lalu buka tabel seperti:
- `DailyLog`
- `AttendanceRecord`
- `MonthlyArchive`

Di Prisma Studio Anda bisa:
- Lihat data
- Edit data
- Hapus data
- Tambah data manual

### 2. Cek koneksi database cepat

```bash
npm run prisma:generate
```

Jika command ini sukses, biasanya koneksi + schema valid.

## Perintah Reset / Bersih Data

## Peringatan
Perintah di bawah menghapus data permanen. Gunakan hanya saat perlu.

### 1. Hapus semua data absensi (tetap pertahankan struktur tabel)

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{await prisma.attendanceRecord.deleteMany();await prisma.dailyLog.deleteMany();await prisma.monthlyArchive.deleteMany();console.log('OK: Semua data absensi dihapus');process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

### 2. Hapus data hari tertentu saja

Contoh: hapus data tanggal `2026-04-17`

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{const d=new Date('2026-04-17T00:00:00.000Z');const log=await prisma.dailyLog.findFirst({where:{date:d}});if(!log){console.log('DailyLog tidak ditemukan');process.exit(0);}await prisma.attendanceRecord.deleteMany({where:{dailyLogId:log.id}});await prisma.dailyLog.delete({where:{id:log.id}});console.log('OK: Data tanggal 2026-04-17 dihapus');process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

### 3. Reset total database development

```bash
npx prisma migrate reset
```

Biasanya command ini akan:
- Drop schema
- Recreate schema
- Menjalankan ulang migration

## Perintah Update Data

### 1. Update status DailyLog menjadi FROZEN

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{const updated=await prisma.dailyLog.updateMany({where:{status:'ACTIVE'},data:{status:'FROZEN'}});console.log('Updated:',updated.count);process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

### 2. Update nama peserta tertentu

Ganti `ID_RECORD_ANDA` sesuai ID record.

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{const row=await prisma.attendanceRecord.update({where:{id:'ID_RECORD_ANDA'},data:{nama:'NAMA BARU'}});console.log('OK:',row.id,row.nama);process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

## Perintah Hapus Data Spesifik

### 1. Hapus satu attendance record berdasarkan ID

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{await prisma.attendanceRecord.delete({where:{id:'ID_RECORD_ANDA'}});console.log('OK: record terhapus');process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

### 2. Hapus semua attendance record tanpa hapus DailyLog

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{const r=await prisma.attendanceRecord.deleteMany();console.log('Deleted:',r.count);process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

## Perintah Cek Ringkas Data

### 1. Lihat 10 DailyLog terakhir + jumlah peserta

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{const logs=await prisma.dailyLog.findMany({orderBy:{date:'desc'},take:10,include:{_count:{select:{attendanceRecords:true}}}});console.log(JSON.stringify(logs.map(l=>({id:l.id,date:l.date,status:l.status,pdfUrl:l.pdfUrl,count:l._count.attendanceRecords})),null,2));process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

### 2. Lihat peserta hari ini

```bash
node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();(async()=>{const d=new Date();d.setHours(0,0,0,0);const log=await prisma.dailyLog.findFirst({where:{date:d},include:{attendanceRecords:true}});if(!log){console.log('Belum ada DailyLog hari ini');process.exit(0);}console.log(JSON.stringify(log.attendanceRecords,null,2));process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

## Troubleshooting Umum

### 1. Error: table does not exist

```bash
npm run prisma:push
npm run prisma:generate
```

### 2. Error EPERM query_engine di Windows

1. Stop semua proses `npm run dev`.
2. Jalankan ulang:

```bash
npm run prisma:generate
```

3. Setelah sukses, start server lagi:

```bash
npm run dev
```

### 3. Data tidak sinkron setelah ubah schema

```bash
npm run prisma:push
npm run prisma:generate
```

## Rekomendasi Operasional Aman

1. Pakai `prisma:studio` dulu untuk edit/hapus manual (minim risiko typo).
2. Sebelum hapus massal, jalankan query cek ringkas data dulu.
3. Simpan backup data penting sebelum reset besar.
4. Untuk perubahan schema permanen tim, utamakan `prisma:migrate`.

## Ringkasan Perintah Cepat

```bash
# Sinkron schema cepat
npm run prisma:push

# Generate Prisma Client
npm run prisma:generate

# Buka editor database visual
npm run prisma:studio

# Jalankan migration (development)
npm run prisma:migrate

# Reset total DB dev
npx prisma migrate reset
```

---

Jika nanti Anda mau, saya bisa tambahkan juga file `scripts/db-tools.js` berisi menu perintah interaktif (misalnya `npm run db:tools`) supaya Anda tidak perlu copy-paste command panjang lagi.

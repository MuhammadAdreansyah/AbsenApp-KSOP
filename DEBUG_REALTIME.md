# 🔍 Real-Time Update Debug Guide

Jika data absensi tidak bertambah real-time di website, ikuti panduan debugging ini:

## 1️⃣ Buka Browser DevTools

**Chrome/Edge:**
- Tekan `F12` atau `Ctrl + Shift + I`
- Buka tab **Console**

## 2️⃣ Test Database & API

Jalankan di terminal:
```bash
node test-realtime.js
```

Jika semua test pass (✨ All real-time flow tests passed!), maka database dan API bekerja baik.

## 3️⃣ Monitor Console Logs

Setelah developer tools terbuka, submit absensi baru dan perhatikan log di console:

### ✅ Logs yang Seharusnya Muncul:

```
[AttendanceForm] Submission successful: cmoku7d200001dxtc2jlq7wdg
[AttendanceForm] Dispatching "attendance:updated" event
[DailyAttendanceView] Event "attendance:updated" received, fetching...
[DailyAttendanceView] Fetching from: /api/attendance/stats?meetingCode=default
[DailyAttendanceView] API Response: {success: true, data: {...}}
[DailyAttendanceView] Setting data with 1 records
```

### ❌ Jika Ada Error, Perhatikan:

**Error 1: Event tidak di-dispatch**
```
❌ Logs tidak ada: "[AttendanceForm] Dispatching "attendance:updated" event"
```
👉 Kemungkinan: Form submission gagal atau error di server action
- Periksa: Apakah ada error toast/notification?
- Periksa: Console error log

**Error 2: Event tidak di-terima**
```
❌ Logs tidak ada: "[DailyAttendanceView] Event "attendance:updated" received"
```
👉 Kemungkinan: Event listener tidak terdaftar atau component belum mount
- Periksa: Apakah ada log: "[DailyAttendanceView] Event listener registered"?
- Periksa: Refresh page dan coba lagi

**Error 3: API fetch gagal**
```
❌ Logs error di Fetching atau API Response error
```
👉 Kemungkinan: Endpoint error atau network issue
- Periksa: Network tab di DevTools → `/api/attendance/stats`
- Periksa: Response status code dan body

**Error 4: Data tidak set ke state**
```
❌ Logs tidak ada: "[DailyAttendanceView] Setting data with"
```
👉 Kemungkinan: API response format tidak match atau isMounted=false
- Periksa: API response structure punya `attendanceRecords` array?

## 4️⃣ Test Polling Interval

Polling otomatis setiap 3 detik. Logs akan muncul:
```
[DailyAttendanceView] Polling interval triggered
```

Jika tidak ada, kemungkinan:
- Interval sudah di-clear (component unmounted)
- Browser tab tidak fokus (browser pause timer)

## 5️⃣ Network Debugging

1. Buka **Network tab** di DevTools
2. Submit absensi baru
3. Cari request ke `/api/attendance/stats`
4. Periksa:
   - **Status**: Seharusnya `200`
   - **Response**: Harus punya `{success: true, data: {id, date, status, pdfUrl, attendanceRecords}}`
   - **Headers**: `Content-Type: application/json`

## 6️⃣ Browser Cache Issue

Jika masih tidak berhasil:
```bash
# Hard refresh (bypass cache)
Ctrl + Shift + R  (Chrome/Firefox)
Cmd + Shift + R   (Mac)
```

## 7️⃣ Server-Side Debugging

Jika database dan API test pass tapi UI tidak update:

1. **Periksa logger di server:**
   ```bash
   # Tail logs jika ada
   npm run dev
   ```

2. **Manual test API:**
   ```bash
   curl "http://localhost:3000/api/attendance/stats?meetingCode=default"
   ```

## 8️⃣ Checklist Debugging

- [ ] Database test pass (`node test-realtime.js` ✨)
- [ ] Form console log: "[AttendanceForm] Submission successful"
- [ ] Event console log: "[AttendanceForm] Dispatching event"
- [ ] Component console log: "[DailyAttendanceView] Event ... received"
- [ ] API response 200 OK
- [ ] API response punya `attendanceRecords` array
- [ ] Component log: "Setting data with X records"
- [ ] UI menampilkan data terbaru

## 📱 Testing pada Device Berbeda

Real-time update hanya bekerja pada **tab/window yang sama**:
- ✅ Submit di form → Data tampil di list (sama window)
- ❌ Submit di tab 1 → Tidak tampil di tab 2 (window berbeda, event tidak di-share)

Untuk sync antar tab, perlu WebSocket atau database subscription (fitur future).

## 🚀 Performance Tips

Polling setiap 3 detik mungkin terlalu sering jika banyak user. Bisa di-adjust:
```typescript
// Di: src/components/daily-attendance-view.tsx
const interval = setInterval(() => {
  void fetchData(false);
}, 5000); // Ubah ke 5000ms (5 detik) jika diperlukan
```

---

**Jika masih tidak berhasil**, salin semua console logs dan share error message-nya!

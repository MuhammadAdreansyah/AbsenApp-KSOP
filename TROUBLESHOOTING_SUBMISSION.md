# 🔍 Troubleshooting Attendance Submission Error

## Current Status
✅ Dev server running at http://localhost:3000
✅ Code fixes applied (Supabase bucket name, fallback signature)

---

## Step 1: Test Attendance Submission

### Via Browser (Manual)
```
1. Open: http://localhost:3000/dashboard
2. Fill form:
   - Nama: "Test User"
   - Jabatan: "Staff"
   - Agenda: "Test Submission"
   - Signature: Draw anything
3. Click "Simpan"
4. Check results
```

### Monitor Console & Logs
```
1. Open DevTools (F12) → Console tab
2. Watch for logs starting with [AttendanceForm] or [DailyAttendanceView]
3. Look for error messages
4. Take screenshot of error
```

---

## Step 2: Collect Error Information

**If submission fails, check 3 places:**

### A. Browser Console (F12)
```
Look for:
❌ Toast error message at top
❌ [AttendanceForm] Error logs
❌ Fetch error details
```

### B. Terminal/Server Logs
```
Watch npm run dev terminal for:
- Error stack trace
- "Signature upload failed"
- "Database connection error"
- "Validation error"
```

### C. Network Tab (F12)
```
1. Open DevTools → Network tab
2. Filter for: XHR or Fetch
3. Find POST/request related to attendance
4. Check:
   - Status code
   - Response body (error message)
   - Request body
```

---

## Common Errors & Fixes

### Error 1: "Gagal mengambil data absensi" (API Error)
```
Possible causes:
- Database connection failed
- DailyLog not found
- Prisma error

Fix:
npm run db:seed  # Reset database
npm run prisma:push  # Update schema
npm run dev  # Restart
```

### Error 2: "Signature tidak valid"
```
Possible causes:
- Signature capture failed
- Base64 conversion error

Fix:
- Redraw signature clearly
- Check signature pad component
```

### Error 3: "Terjadi kesalahan saat menyimpan data"
```
Possible causes:
- Supabase config issue (not critical)
- Database insert failed
- Validation error

Expected: Should fallback to base64 storage
If still fails: Check database connection
```

---

## Quick Diagnostic Steps

### 1. Check Database Connection
```bash
# Run in terminal:
npm run prisma:studio
# This opens Prisma admin at http://localhost:5555
# Try to view AttendanceRecord table
```

### 2. Check Supabase Config
```bash
# In .env file, check:
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_PDF_BUCKET=xxx

# If missing SUPABASE_* → it's OK, using fallback
```

### 3. Check Server Logs
```bash
# Look at npm run dev terminal output
# Errors should show with context
```

---

## Testing Checklist

- [ ] Dev server running
- [ ] Can load dashboard page
- [ ] Form renders properly
- [ ] Can draw signature
- [ ] Form submits (button clickable)
- [ ] See success/error toast
- [ ] Check console logs
- [ ] Check server terminal logs

---

## Report Format

When sharing error, please provide:

```
1. Error Message (from toast/console):
   [Copy exact error text]

2. Browser Console Logs (F12 → Console):
   [Copy [AttendanceForm] logs]

3. Server Terminal Output:
   [Copy error stack trace]

4. Network Response (F12 → Network):
   Status: ___
   Response: ___

5. .env Configuration:
   - Supabase configured? YES / NO / PARTIAL
   - DATABASE_URL set? YES / NO
```

---

## Next Actions

1. **Test manually** → submit attendance form
2. **Collect error** → screenshot/copy error message
3. **Share error** → paste into chat
4. **Diagnose** → identify root cause
5. **Fix** → apply targeted fix

---

**Ready?** Open http://localhost:3000/dashboard and try submitting!

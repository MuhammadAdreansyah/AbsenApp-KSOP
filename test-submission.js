#!/usr/bin/env node
/**
 * test-attendance-submission.js
 * Test script untuk diagnose attendance submission error
 */

const http = require('http');

async function testAttendanceSubmission() {
  console.log('🧪 Testing Attendance Submission...\n');
  
  // Create minimal test data
  const testData = {
    nama: 'Test User ' + Date.now(),
    nip: 'TEST-001',
    agenda: 'Test Attendance Submission',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 pixel PNG
  };

  console.log('📦 Test Data:');
  console.log(`  nama: ${testData.nama}`);
  console.log(`  nip: ${testData.nip}`);
  console.log(`  agenda: ${testData.agenda}`);
  console.log(`  signature: [base64 PNG data]\n`);

  try {
    // Try to call the server action via API route instead
    // Since server actions are not directly accessible, test via form submission simulation
    
    console.log('🔗 Testing via HTTP POST to simulate form submission...\n');
    
    // Test attendance/list endpoint first to check API health
    const healthResponse = await fetch('http://localhost:3000/api/attendance/stats?meetingCode=default', {
      method: 'GET',
    });
    
    const health = await healthResponse.json();
    console.log('✓ API Health Check:');
    console.log(`  Status: ${healthResponse.status}`);
    console.log(`  Has data: ${!!health.data}`);
    console.log(`  Records: ${health.data?.attendanceRecords?.length || 0}\n`);
    
    if (healthResponse.status !== 200) {
      console.log('⚠️ API returned non-200 status. Check server logs.\n');
      return;
    }

    // Now test the submission by checking what happens
    console.log('💾 Attempting submission...');
    console.log('   Note: Since submitAttendance is a Server Action,');
    console.log('   test actual form submission via browser DevTools.\n');
    
    console.log('📝 To test properly:');
    console.log('1. Open browser: http://localhost:3000/dashboard');
    console.log('2. Open DevTools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Fill form and submit');
    console.log('5. Check logs for:');
    console.log('   [AttendanceForm] Submission successful');
    console.log('   OR error messages\n');
    
    console.log('🔍 Server logs should show:');
    console.log('   - Attendance submitted successfully');
    console.log('   - OR: Signature upload to Supabase failed, fallback ke database');
    console.log('   - OR: error message with stack trace\n');

  } catch (err) {
    console.log(`❌ Error: ${err.message}\n`);
  }
}

testAttendanceSubmission();

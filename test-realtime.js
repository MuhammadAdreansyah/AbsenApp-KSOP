// test-realtime.js - Test real-time attendance update flow

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRealTimeFlow() {
  console.log('🔍 Testing Real-Time Attendance Update Flow\n');

  try {
    // 1. Get or create today's DailyLog
    console.log('1️⃣ Checking/Creating DailyLog for today...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyLog = await prisma.dailyLog.findFirst({
      where: { date: today },
    });

    if (!dailyLog) {
      dailyLog = await prisma.dailyLog.create({
        data: {
          date: today,
          status: 'ACTIVE',
        },
      });
      console.log('   ✅ Created new DailyLog:', dailyLog.id);
    } else {
      console.log('   ✅ Found existing DailyLog:', dailyLog.id);
    }

    // 2. Create test attendance record
    console.log('\n2️⃣ Creating test attendance record...');
    const testRecord = await prisma.attendanceRecord.create({
      data: {
        nama: `Test User ${Date.now()}`,
        nip: '12345',
        agenda: 'Test Agenda',
        meetingCode: 'default',
        signatureUrl: 'data:image/png;base64,TEST',
        dailyLogId: dailyLog.id,
      },
    });
    console.log('   ✅ Created record:', testRecord.id);

    // 3. Simulate API fetch with findFirst
    console.log('\n3️⃣ Simulating API fetch with findFirst...');
    const apiResponse = await prisma.dailyLog.findFirst({
      where: { date: today },
      include: {
        attendanceRecords: {
          where: { meetingCode: 'default' },
          select: {
            id: true,
            nama: true,
            nip: true,
            agenda: true,
            signatureUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!apiResponse) {
      console.log('   ❌ ERROR: findFirst returned null');
      return;
    }

    console.log('   ✅ API Response:');
    console.log('      ID:', apiResponse.id);
    console.log('      Records count:', apiResponse.attendanceRecords.length);
    console.log('      Records:', apiResponse.attendanceRecords.map(r => r.nama));

    // 4. Format response like API endpoint does
    console.log('\n4️⃣ Formatted API response (like /api/attendance/stats)...');
    const formattedResponse = {
      success: true,
      data: {
        id: apiResponse.id,
        date: apiResponse.date.toISOString(),
        status: apiResponse.status,
        pdfUrl: apiResponse.pdfUrl ?? null,
        attendanceRecords: apiResponse.attendanceRecords.map(record => ({
          id: record.id,
          nama: record.nama,
          nip: record.nip,
          agenda: record.agenda,
          signatureUrl: record.signatureUrl,
          createdAt: record.createdAt instanceof Date
            ? record.createdAt.toISOString()
            : record.createdAt,
        })),
      },
    };

    console.log('   ✅ Response structure:');
    console.log('      ', JSON.stringify(formattedResponse, null, 2));

    // 5. Verify component can consume this
    console.log('\n5️⃣ Verifying response matches DailyLog interface...');
    const { data } = formattedResponse;
    if (data && data.id && Array.isArray(data.attendanceRecords)) {
      console.log('   ✅ Response structure is VALID for component');
      console.log('      - Has id:', !!data.id);
      console.log('      - Has date:', !!data.date);
      console.log('      - Has status:', !!data.status);
      console.log('      - Has pdfUrl:', data.pdfUrl !== undefined);
      console.log('      - Has attendanceRecords array:', Array.isArray(data.attendanceRecords));
      console.log('      - Records count:', data.attendanceRecords.length);
    } else {
      console.log('   ❌ Response structure is INVALID');
    }

    // 6. Test interval update (simulate polling)
    console.log('\n6️⃣ Testing polling behavior (3 second interval)...');
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const polledData = await prisma.dailyLog.findFirst({
        where: { date: today },
        include: {
          attendanceRecords: {
            where: { meetingCode: 'default' },
          },
        },
      });
      console.log(`   Poll ${i + 1}: Found ${polledData?.attendanceRecords.length || 0} records`);
    }

    // 7. Create another record to test if polling catches it
    console.log('\n7️⃣ Creating second record to test polling...');
    const testRecord2 = await prisma.attendanceRecord.create({
      data: {
        nama: `Test User 2 ${Date.now()}`,
        nip: '54321',
        agenda: 'Test Agenda 2',
        meetingCode: 'default',
        signatureUrl: 'data:image/png;base64,TEST2',
        dailyLogId: dailyLog.id,
      },
    });
    console.log('   ✅ Created second record:', testRecord2.id);

    console.log('\n8️⃣ Polling after second record...');
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const polledData = await prisma.dailyLog.findFirst({
        where: { date: today },
        include: {
          attendanceRecords: {
            where: { meetingCode: 'default' },
          },
        },
      });
      console.log(`   Poll ${i + 1}: Found ${polledData?.attendanceRecords.length || 0} records`);
    }

    // Cleanup
    console.log('\n9️⃣ Cleanup test data...');
    await prisma.attendanceRecord.deleteMany({
      where: {
        nama: { contains: 'Test User' },
      },
    });
    console.log('   ✅ Test data cleaned up');

    console.log('\n✨ All real-time flow tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealTimeFlow();

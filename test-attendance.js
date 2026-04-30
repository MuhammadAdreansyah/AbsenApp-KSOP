// Test script to diagnose attendance saving issues
const { PrismaClient } = require('@prisma/client');

async function testAttendance() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing Database Connection...\n');

    // Test 1: Check tables exist
    console.log('1️⃣ Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`   Found ${tables.length} tables:`, tables.map(t => t.table_name).join(', '));

    // Test 2: Check DailyLog table
    console.log('\n2️⃣ Checking DailyLog structure...');
    const dailyLogColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'DailyLog'
    `;
    console.log('   Columns:', dailyLogColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '));

    // Test 3: Try to create a DailyLog record
    console.log('\n3️⃣ Testing DailyLog creation...');
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
    }
    console.log('   ✅ DailyLog created/found:', dailyLog.id);

    // Test 4: Try to create an AttendanceRecord
    console.log('\n4️⃣ Testing AttendanceRecord creation...');
    const record = await prisma.attendanceRecord.create({
      data: {
        nama: 'TEST USER',
        nip: 'TEST123',
        agenda: 'Test agenda description here',
        meetingCode: 'test',
        signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        dailyLogId: dailyLog.id,
      },
    });
    console.log('   ✅ AttendanceRecord created:', record.id);

    // Test 5: Retrieve the data
    console.log('\n5️⃣ Testing data retrieval...');
    const retrieved = await prisma.dailyLog.findFirst({
      where: { date: today },
      include: { attendanceRecords: true },
    });
    console.log('   ✅ Retrieved:', retrieved.attendanceRecords.length, 'records');

    // Test 6: Clean up
    console.log('\n6️⃣ Cleaning up test data...');
    await prisma.attendanceRecord.delete({ where: { id: record.id } });
    console.log('   ✅ Test record deleted');

    console.log('\n✨ All tests passed! Database is working correctly.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAttendance();

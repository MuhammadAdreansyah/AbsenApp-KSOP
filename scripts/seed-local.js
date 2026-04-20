const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyLog = await prisma.dailyLog.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      status: "ACTIVE",
    },
  });

  const existingCount = await prisma.attendanceRecord.count({
    where: { dailyLogId: dailyLog.id },
  });

  if (existingCount > 0) {
    console.log(`Seed dilewati: sudah ada ${existingCount} data absensi untuk hari ini.`);
    return;
  }

  const seedRows = [
    {
      nama: "Muhammad Adreansyah Pratama Lubis",
      nip: "Kepala Kantor",
      agenda: "Rapat Koordinasi Internal Pelayanan Pelabuhan",
      signatureUrl: "",
      dailyLogId: dailyLog.id,
    },
    {
      nama: "Siti Rahmawati",
      nip: "Kepala Sub Bagian Tata Usaha",
      agenda: "Pembahasan Standar Operasional Administrasi",
      signatureUrl: "",
      dailyLogId: dailyLog.id,
    },
    {
      nama: "Andi Prasetyo",
      nip: "Koordinator Operasional",
      agenda: "Evaluasi Kinerja Pelayanan Bulanan",
      signatureUrl: "",
      dailyLogId: dailyLog.id,
    },
  ];

  const created = await prisma.attendanceRecord.createMany({
    data: seedRows,
  });

  console.log(`Seed berhasil: ${created.count} data absensi contoh ditambahkan.`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

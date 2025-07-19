import { PrismaClient } from '@prisma/client';

export async function seedSourceOther(prisma: PrismaClient) {
  console.log('📚 Seeding source others...');

  const data = [
    {
      name: 'Nhân viên nội bộ',
      specifically: 'Đề xuất bởi nhân viên',
    },
    {
      name: 'Đối tác',
      specifically: 'Công ty liên kết',
    },
    {
      name: 'Khác',
      specifically: 'Nguồn khác không xác định',
    },
  ];

  for (const item of data) {
    await prisma.sourceOther.create({
      data: item,
    });
  }

  console.log(`✅ Seeded ${data.length} source others`);
}

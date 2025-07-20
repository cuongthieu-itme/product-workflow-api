import { PrismaClient } from '@prisma/client';

export async function seedOrigin(prisma: PrismaClient) {
  console.log('🗺️  Creating origins...');

  const origins = [
    { name: 'Anh' },
    { name: 'Australia' },
    { name: 'Hàn Quốc' },
    { name: 'Indonesia' },
    { name: 'Malaysia' },
    { name: 'Mỹ' },
  ];

  for (const origin of origins) {
    const result = await prisma.origin.upsert({
      where: { name: origin.name },
      update: {},
      create: {
        name: origin.name,
      },
    });

    console.log(`✅ Origin created: ${result.name}`);
  }

  console.log('🌱 Origin seeding completed');
}

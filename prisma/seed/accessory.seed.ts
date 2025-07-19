import { PrismaClient } from '@prisma/client';

export async function seedAccessory(prisma: PrismaClient) {
  console.log('🔩 Seeding accessories...');

  const accessories = [
    {
      name: 'Ốc vít',
      code: 'ACC-001',
      quantity: 1000,
      description: 'Ốc vít thép không gỉ',
      image: [],
    },
    {
      name: 'Bu lông',
      code: 'ACC-002',
      quantity: 500,
      description: 'Bu lông cường độ cao',
      image: [],
    },
    {
      name: 'Keo dán',
      code: 'ACC-003',
      quantity: 200,
      description: 'Keo dán đa năng',
      image: [],
    },
  ];

  for (const accessory of accessories) {
    await prisma.accessory.create({
      data: accessory,
    });
  }

  console.log(`✅ Seeded ${accessories.length} accessories`);
}

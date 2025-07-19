import { PrismaClient } from '@prisma/client';

export async function seedIngredient(prisma: PrismaClient) {
  console.log('🥕 Seeding ingredients...');

  const ingredients = [
    {
      name: 'Bột mì',
      code: 'ING-001',
      quantity: 100,
      unit: 'kg',
      origin: 'Việt Nam',
      description: 'Bột mì chất lượng cao',
      image: [],
    },
    {
      name: 'Đường',
      code: 'ING-002',
      quantity: 50,
      unit: 'kg',
      origin: 'Thái Lan',
      description: 'Đường tinh luyện',
      image: [],
    },
    {
      name: 'Muối',
      code: 'ING-003',
      quantity: 30,
      unit: 'kg',
      origin: 'Việt Nam',
      description: 'Muối biển tự nhiên',
      image: [],
    },
  ];

  for (const ingredient of ingredients) {
    await prisma.ingredient.create({
      data: ingredient,
    });
  }

  console.log(`✅ Seeded ${ingredients.length} ingredients`);
}

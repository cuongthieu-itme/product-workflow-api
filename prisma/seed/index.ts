import { PrismaClient } from '@prisma/client';
import { seedDepartment } from './department.seed';
import { seedUser } from './user.seed';
import { seedIngredient } from './ingredient.seed';
import { seedAccessory } from './accessory.seed';
import { seedSourceOther } from './sourceOther.seed';
import { seedCustomer } from './customer.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    await seedDepartment(prisma);
    await seedUser(prisma);
    await seedIngredient(prisma);
    await seedAccessory(prisma);
    await seedSourceOther(prisma);
    await seedCustomer(prisma);

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

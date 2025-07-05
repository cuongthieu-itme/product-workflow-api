import { PrismaClient } from '@prisma/client';

export async function seedDepartment(prisma: PrismaClient) {
  console.log('📁 Creating department...');

  const department = await prisma.department.upsert({
    where: { name: 'Quản lý' },
    update: {},
    create: {
      name: 'Quản lý',
      description: 'Phòng ban quản lý công ty',
    },
  });

  console.log('✅ Department created:', department.name);
  return department;
}

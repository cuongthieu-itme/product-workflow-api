import { PrismaClient, Gender, CustomerSource } from '@prisma/client';

export async function seedCustomer(prisma: PrismaClient) {
  console.log('👥 Seeding customers...');

  const adminUser = await prisma.user.findUnique({ where: { email: 'superadmin@gmail.com' } });
  if (!adminUser) {
    console.warn('⚠️  Super admin user not found, skip customer seeding');
    return;
  }

  const customers = [
    {
      fullName: 'Nguyễn Văn A',
      phoneNumber: '0909123456',
      email: 'nva@example.com',
      gender: Gender.MALE,
      dateOfBirth: new Date('1990-01-01'),
      source: CustomerSource.WEBSITE,
      userId: adminUser.id,
    },
    {
      fullName: 'Trần Thị B',
      phoneNumber: '0911222333',
      email: 'ttb@example.com',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1992-05-10'),
      source: CustomerSource.FACEBOOK,
      userId: adminUser.id,
    },
  ];

  for (const customer of customers) {
    await prisma.customer.create({ data: customer });
  }

  console.log(`✅ Seeded ${customers.length} customers`);
}

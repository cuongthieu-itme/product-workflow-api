import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUser(prisma: PrismaClient) {
  console.log('👤 Creating super admin user...');

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {
      fullName: 'Super Admin',
      userName: 'superadmin',
      phoneNumber: '0123456789',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isVerifiedAccount: true,
      verifiedDate: new Date(),
    },
    create: {
      fullName: 'Super Admin',
      userName: 'superadmin',
      email: 'superadmin@gmail.com',
      phoneNumber: '0123456789',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isVerifiedAccount: true,
      verifiedDate: new Date(),
    },
  });

  console.log('✅ Super admin user created:', user.userName);
  return user;
}

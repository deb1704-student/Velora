import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Velora platform identities and administrator accounts...');

  const passwordHash = await bcrypt.hash('AdminSecretPass123!', 10);
  const userPasswordHash = await bcrypt.hash('SecurePassword123!', 10);

  // 1. Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@velora.luxury' },
    update: {
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
    create: {
      email: 'admin@velora.luxury',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });
  console.log(`[Seed] Super Admin upserted: ${admin.email} (${admin.id})`);

  // 2. Verified Specialist Provider
  const specialist = await prisma.user.upsert({
    where: { email: 'specialist.demo@velora.com' },
    update: {
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'specialist.demo@velora.com',
      passwordHash: userPasswordHash,
      firstName: 'Anya',
      lastName: 'Valerius',
      phoneNumber: '+1555987654',
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
      providerProfile: {
        create: {
          bio: 'Master colorist and trichology expert with 10+ years experience in European salons.',
          experienceYears: 10,
          providesHomeService: true,
          providesSalonService: true,
          travelRadiusKm: 25,
          kycStatus: 'VERIFIED',
          commissionRate: 15.0,
        },
      },
    },
  });
  console.log(`[Seed] Specialist provider verified: ${specialist.email} (${specialist.id})`);

  // 3. Customer Demo
  const customer = await prisma.user.upsert({
    where: { email: 'customer.demo@velora.com' },
    update: {
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'customer.demo@velora.com',
      passwordHash: userPasswordHash,
      firstName: 'Siddharth',
      lastName: 'Verma',
      phoneNumber: '+1555123456',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: {
        create: {
          loyaltyTier: 'VIP',
          loyaltyPoints: 1250,
          allergies: ['Ammonia', 'Synthetic Fragrance'],
          notes: 'Prefers quiet sessions and organic cold-pressed serums.',
        },
      },
    },
  });
  console.log(`[Seed] Customer verified: ${customer.email} (${customer.id})`);

  console.log('Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

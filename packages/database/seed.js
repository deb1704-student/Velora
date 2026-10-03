const { PrismaClient, UserRole, UserStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

  // 2. Ensure specialist status is ACTIVE with APPROVED profile
  const specialist = await prisma.user.findUnique({
    where: { email: 'specialist.demo@velora.com' },
  });
  if (specialist) {
    await prisma.user.update({
      where: { id: specialist.id },
      data: { status: UserStatus.ACTIVE },
    });
    await prisma.providerProfile.upsert({
      where: { userId: specialist.id },
      update: {
        verificationStatus: 'APPROVED',
        isActive: true,
        serviceRadiusKm: 25,
        isHomeServiceAvailable: true,
        isSalonServiceAvailable: true,
        bio: 'Master colorist and trichology expert with 10+ years experience in European salons.',
        experienceYears: 10,
      },
      create: {
        userId: specialist.id,
        verificationStatus: 'APPROVED',
        isActive: true,
        serviceRadiusKm: 25,
        isHomeServiceAvailable: true,
        isSalonServiceAvailable: true,
        bio: 'Master colorist and trichology expert with 10+ years experience in European salons.',
        experienceYears: 10,
      },
    });
    console.log(`[Seed] Specialist provider verified: ${specialist.email}`);
  }

  // 3. Ensure customer status is ACTIVE
  await prisma.user.updateMany({
    where: { email: 'customer.demo@velora.com' },
    data: { status: UserStatus.ACTIVE }
  });

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

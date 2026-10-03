const { PrismaClient, UserRole, UserStatus, ServiceDeliveryType } = require('@prisma/client');
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
  let specialistProfileId = null;
  const specialist = await prisma.user.findUnique({
    where: { email: 'specialist.demo@velora.com' },
  });
  if (specialist) {
    await prisma.user.update({
      where: { id: specialist.id },
      data: { status: UserStatus.ACTIVE },
    });
    const profile = await prisma.providerProfile.upsert({
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
    specialistProfileId = profile.id;
    console.log(`[Seed] Specialist provider verified: ${specialist.email}`);
  }

  // 3. Ensure customer status is ACTIVE
  await prisma.user.updateMany({
    where: { email: 'customer.demo@velora.com' },
    data: { status: UserStatus.ACTIVE }
  });

  // 4. Find Salon
  const salon = await prisma.salon.findFirst({
    where: { slug: 'maison-de-velora' },
  });

  // ==========================================
  // 5. SERVICE CATALOG SEEDING (D5)
  // ==========================================
  console.log('Seeding Velora luxury service catalog categories...');

  // Top-Level Categories
  const hairCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'hair-and-styling' },
    update: { name: 'Hair & Styling', sortOrder: 1 },
    create: {
      name: 'Hair & Styling',
      slug: 'hair-and-styling',
      description: 'Couture hair cuts, bespoke color artistry, and restorative scalp therapies.',
      sortOrder: 1,
      isActive: true,
    },
  });

  const skinCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'aesthetics-and-skincare' },
    update: { name: 'Aesthetics & Skincare', sortOrder: 2 },
    create: {
      name: 'Aesthetics & Skincare',
      slug: 'aesthetics-and-skincare',
      description: 'Advanced clinical facials, peptide resurfacing, and dermal hydration.',
      sortOrder: 2,
      isActive: true,
    },
  });

  const nailsCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'nails-and-hand-therapy' },
    update: { name: 'Nails & Hand Therapy', sortOrder: 3 },
    create: {
      name: 'Nails & Hand Therapy',
      slug: 'nails-and-hand-therapy',
      description: 'Russian hardware manicures, botanical pedicures, and nail architecture.',
      sortOrder: 3,
      isActive: true,
    },
  });

  const menCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'mens-executive-grooming' },
    update: { name: "Men's Executive Grooming", sortOrder: 4 },
    create: {
      name: "Men's Executive Grooming",
      slug: 'mens-executive-grooming',
      description: 'Artisanal hot towel straight razor shaves, fade engineering, and scalp scrubs.',
      sortOrder: 4,
      isActive: true,
    },
  });

  // Subcategories
  const balayageSub = await prisma.serviceCategory.upsert({
    where: { slug: 'color-and-balayage' },
    update: { parentId: hairCategory.id, sortOrder: 1 },
    create: {
      name: 'Color & Balayage',
      slug: 'color-and-balayage',
      description: 'Bespoke multidimensional lightning and toners.',
      parentId: hairCategory.id,
      sortOrder: 1,
    },
  });

  const spaSub = await prisma.serviceCategory.upsert({
    where: { slug: 'hair-spa-and-treatments' },
    update: { parentId: hairCategory.id, sortOrder: 2 },
    create: {
      name: 'Hair Spa & Treatments',
      slug: 'hair-spa-and-treatments',
      description: 'Intense keratin reconstruction and moisture infusion.',
      parentId: hairCategory.id,
      sortOrder: 2,
    },
  });

  const facialSub = await prisma.serviceCategory.upsert({
    where: { slug: 'clinical-facials' },
    update: { parentId: skinCategory.id, sortOrder: 1 },
    create: {
      name: 'Clinical Facials',
      slug: 'clinical-facials',
      description: 'Medical-grade hydradermabrasion and oxygen therapy.',
      parentId: skinCategory.id,
      sortOrder: 1,
    },
  });

  console.log('Seeding service items & add-on boosters...');

  // Service 1: French Balayage & Glaze
  const s1 = await prisma.serviceItem.upsert({
    where: { slug: 'french-balayage-and-glaze' },
    update: {
      basePrice: 4200.0,
      durationMinutes: 150,
      deliveryType: ServiceDeliveryType.BOTH,
    },
    create: {
      categoryId: balayageSub.id,
      name: 'French Balayage & Glaze',
      slug: 'french-balayage-and-glaze',
      description: 'Artisanal freehand gradient highlighting tailored to hair contour with translucent acid gloss.',
      durationMinutes: 150,
      basePrice: 4200.0,
      currency: 'INR',
      deliveryType: ServiceDeliveryType.BOTH,
      requirements: 'Clean dry hair. Consultation included in appointment.',
      imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803',
      isActive: true,
    },
  });

  // Service 2: Japanese Silk Protein Hair Spa
  const s2 = await prisma.serviceItem.upsert({
    where: { slug: 'japanese-silk-protein-spa' },
    update: {
      basePrice: 2800.0,
      durationMinutes: 60,
      deliveryType: ServiceDeliveryType.BOTH,
    },
    create: {
      categoryId: spaSub.id,
      name: 'Japanese Silk Protein Hair Spa',
      slug: 'japanese-silk-protein-spa',
      description: 'Multi-layer amino acid and hydrolyzed silk moisture therapy under ultrasonic nano-mist.',
      durationMinutes: 60,
      basePrice: 2800.0,
      currency: 'INR',
      deliveryType: ServiceDeliveryType.BOTH,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
      isActive: true,
    },
  });

  // Service 3: Hydrafacial Platinum Infusion
  const s3 = await prisma.serviceItem.upsert({
    where: { slug: 'hydrafacial-platinum-infusion' },
    update: {
      basePrice: 5500.0,
      durationMinutes: 75,
      deliveryType: ServiceDeliveryType.BOTH,
    },
    create: {
      categoryId: facialSub.id,
      name: 'Hydrafacial Platinum Infusion',
      slug: 'hydrafacial-platinum-infusion',
      description: 'Vortex suction deep-pore detox, painless extractions, and antioxidant peptide saturation.',
      durationMinutes: 75,
      basePrice: 5500.0,
      currency: 'INR',
      deliveryType: ServiceDeliveryType.BOTH,
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
      isActive: true,
    },
  });

  // Service 4: Russian Architecture Manicure
  const s4 = await prisma.serviceItem.upsert({
    where: { slug: 'russian-architecture-manicure' },
    update: {
      basePrice: 1900.0,
      durationMinutes: 90,
      deliveryType: ServiceDeliveryType.BOTH,
    },
    create: {
      categoryId: nailsCategory.id,
      name: 'Russian Architecture Manicure',
      slug: 'russian-architecture-manicure',
      description: 'Diamond-burr cuticle perfection with rubber base alignment and long-wear pigment finish.',
      durationMinutes: 90,
      basePrice: 1900.0,
      currency: 'INR',
      deliveryType: ServiceDeliveryType.BOTH,
      imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53',
      isActive: true,
    },
  });

  // Service 5: Executive Royal Shave & Scalp Scrub
  const s5 = await prisma.serviceItem.upsert({
    where: { slug: 'executive-royal-shave' },
    update: {
      basePrice: 1500.0,
      durationMinutes: 45,
      deliveryType: ServiceDeliveryType.BOTH,
    },
    create: {
      categoryId: menCategory.id,
      name: 'Executive Royal Shave & Scalp Scrub',
      slug: 'executive-royal-shave',
      description: 'Triple-pass straight razor shave with botanical pre-shave oil, eucalyptus hot towels, and alum stone cool down.',
      durationMinutes: 45,
      basePrice: 1500.0,
      currency: 'INR',
      deliveryType: ServiceDeliveryType.BOTH,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1',
      isActive: true,
    },
  });

  // Addons for Balayage (s1)
  await prisma.serviceAddon.deleteMany({
    where: { serviceId: s1.id },
  });
  await prisma.serviceAddon.createMany({
    data: [
      {
        serviceId: s1.id,
        name: 'Olaplex No. 1 & 2 Bond Multiplier',
        description: 'Patented bis-aminopropyl diglycol dimaleate complex protecting disulfide bonds during lightener application.',
        extraDurationMinutes: 15,
        price: 850.0,
        isActive: true,
      },
      {
        serviceId: s1.id,
        name: 'Organic Cold-Pressed Argan Scalp Scrub',
        description: 'Exfoliating sea salt scrub removing chemical residues and restoring cellular microcirculation.',
        extraDurationMinutes: 15,
        price: 600.0,
        isActive: true,
      },
    ],
  });

  // Addons for Hydrafacial (s3)
  await prisma.serviceAddon.deleteMany({
    where: { serviceId: s3.id },
  });
  await prisma.serviceAddon.createMany({
    data: [
      {
        serviceId: s3.id,
        name: 'Cryo-Oxygen Cold Dermal Wand',
        description: 'Sub-zero cryo-stimulation locking serum active agents and instantly reducing facial erythema.',
        extraDurationMinutes: 15,
        price: 950.0,
        isActive: true,
      },
      {
        serviceId: s3.id,
        name: 'Bio-Cellulose Peptide Eye Contour Sheet',
        description: 'Intense caffeine and marine elastin treatment smoothing crow’s feet and morning puffiness.',
        extraDurationMinutes: 10,
        price: 450.0,
        isActive: true,
      },
    ],
  });

  // Bundled Packages
  console.log('Seeding bundled multi-service packages...');
  const bridalPackage = await prisma.servicePackage.upsert({
    where: { slug: 'bridal-radiance-glow-suite' },
    update: {
      price: 9800.0,
      durationMinutes: 280,
    },
    create: {
      name: 'Bridal Radiance Glow Suite',
      slug: 'bridal-radiance-glow-suite',
      description: 'Comprehensive pre-wedding luxury ritual: Hydrafacial Platinum Infusion, Japanese Silk Hair Spa, and Russian Architecture Manicure.',
      price: 9800.0,
      currency: 'INR',
      discountPercentage: 20.0,
      durationMinutes: 280,
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
      isActive: true,
      items: {
        create: [
          { serviceId: s3.id, sortOrder: 0 },
          { serviceId: s2.id, sortOrder: 1 },
          { serviceId: s4.id, sortOrder: 2 },
        ],
      },
    },
  });
  console.log(`[Seed] Bundled package upserted: ${bridalPackage.name}`);

  // Salon-specific Service Offerings (Maison de Velora)
  if (salon) {
    console.log(`Linking catalog services to salon studio: ${salon.name}`);
    await prisma.salonService.upsert({
      where: {
        salonId_serviceId: { salonId: salon.id, serviceId: s1.id },
      },
      update: { customPrice: 4500.0, customDuration: 160 },
      create: {
        salonId: salon.id,
        serviceId: s1.id,
        customPrice: 4500.0,
        customDuration: 160,
      },
    });

    await prisma.salonService.upsert({
      where: {
        salonId_serviceId: { salonId: salon.id, serviceId: s2.id },
      },
      update: { customPrice: 3000.0 },
      create: {
        salonId: salon.id,
        serviceId: s2.id,
        customPrice: 3000.0,
      },
    });

    await prisma.salonService.upsert({
      where: {
        salonId_serviceId: { salonId: salon.id, serviceId: s3.id },
      },
      update: { customPrice: 5900.0 },
      create: {
        salonId: salon.id,
        serviceId: s3.id,
        customPrice: 5900.0,
      },
    });
  }

  // Specialist Provider Qualifications
  if (specialistProfileId) {
    console.log('Certifying specialist provider for services...');
    await prisma.providerService.upsert({
      where: {
        providerId_serviceId: { providerId: specialistProfileId, serviceId: s1.id },
      },
      update: { isCertified: true },
      create: {
        providerId: specialistProfileId,
        serviceId: s1.id,
        isCertified: true,
      },
    });

    await prisma.providerService.upsert({
      where: {
        providerId_serviceId: { providerId: specialistProfileId, serviceId: s2.id },
      },
      update: { isCertified: true },
      create: {
        providerId: specialistProfileId,
        serviceId: s2.id,
        isCertified: true,
      },
    });

    // Also certify for Hydrafacial
    await prisma.providerService.upsert({
      where: {
        providerId_serviceId: { providerId: specialistProfileId, serviceId: s3.id },
      },
      update: { isCertified: true },
      create: {
        providerId: specialistProfileId,
        serviceId: s3.id,
        isCertified: true,
      },
    });

    // Seed weekly schedules for specialist (Monday - Saturday)
    console.log('Seeding recurring weekly working hours for specialist...');
    const workingDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    for (const day of workingDays) {
      await prisma.providerSchedule.upsert({
        where: {
          providerId_dayOfWeek: { providerId: specialistProfileId, dayOfWeek: day },
        },
        update: {
          startTime: '09:00',
          endTime: '19:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          isActive: true,
        },
        create: {
          providerId: specialistProfileId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          isActive: true,
        },
      });
    }

    // Attach specialist to salon if salon exists
    if (salon) {
      await prisma.providerProfile.update({
        where: { id: specialistProfileId },
        data: { salonId: salon.id },
      });
    }
  }

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

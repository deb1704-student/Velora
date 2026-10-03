const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE = 'http://localhost:4000/api/v1';

async function main() {
  console.log('====================================================');
  console.log('VELORA — PHASE 7: BOOKINGS & STATE MACHINE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Authenticate Actors
  console.log('--- Step 0: Authenticating Test Actors ---');
  
  // Login Admin
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@velora.luxury', password: 'AdminSecretPass123!' }),
  }).then((r) => r.json());
  const adminToken = adminLoginRes.data.tokens.accessToken;

  // Login Customer 1
  const cust1LoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer.demo@velora.com', password: 'SecurePassword123!' }),
  }).then((r) => r.json());
  const cust1Token = cust1LoginRes.data.tokens.accessToken;
  const cust1User = cust1LoginRes.data.user;

  // Register Customer 2 (for concurrent & unauthorized testing)
  const cust2Email = `cust2.${Date.now()}@velora.com`;
  const cust2RegRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cust2Email,
      password: 'SecurePassword123!',
      firstName: 'Elena',
      lastName: 'Rostova',
      role: 'CUSTOMER',
    }),
  }).then((r) => r.json());
  const cust2Token = cust2RegRes.data.tokens.accessToken;
  const cust2User = cust2RegRes.data.user;

  // Login Specialist
  const specLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'specialist.demo@velora.com', password: 'SecurePassword123!' }),
  }).then((r) => r.json());
  const specToken = specLoginRes.data.tokens.accessToken;

  // Get Test Service, Salon, Specialist IDs
  const service = await prisma.serviceItem.findFirst({
    where: { slug: 'french-balayage-and-glaze' },
    include: { addons: true },
  });
  const salon = await prisma.salon.findFirst({ where: { slug: 'maison-de-velora' } });
  const specialist = await prisma.providerProfile.findFirst({
    where: { user: { email: 'specialist.demo@velora.com' } },
    include: { user: true },
  });

  const testDate = '2026-10-24'; // Saturday
  console.log(`Test Context: Service=${service.name} (${service.id}), Specialist=${specialist.user.firstName} (${specialist.id}), Salon=${salon.name}\n`);

  // Clean previous test bookings on test dates to start fresh
  await prisma.booking.deleteMany({
    where: {
      appointmentDate: {
        in: [
          new Date('2026-10-24T00:00:00.000Z'),
          new Date('2026-10-31T00:00:00.000Z'),
        ],
      },
    },
  });

  // TEST 1: Successful Booking Creation
  console.log('--- TEST 1: Successful Booking Creation with D5 Price Snapshot & Addons ---');
  const addonId = service.addons[0]?.id;
  const book1Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cust1Token}`,
    },
    body: JSON.stringify({
      serviceId: service.id,
      salonId: salon.id,
      providerId: specialist.id,
      deliveryType: 'SALON',
      appointmentDate: testDate,
      startTime: '09:00',
      addonIds: addonId ? [addonId] : [],
      customerNotes: 'Please prepare botanical color treatment.',
    }),
  }).then((r) => r.json());

  assert(book1Res.success === true, 'Booking 1 created successfully');
  assert(book1Res.data.status === 'CONFIRMED', 'Booking starts in CONFIRMED state with assigned provider');
  assert(book1Res.data.bookingReference.startsWith('VEL-'), 'Unique reference generated (VEL-YYYYMMDD-XXXX)');
  assert(Number(book1Res.data.baseAmount) > 0, 'Base price snapshotted from catalog');
  assert(book1Res.data.statusHistory.length === 1, 'Initial transition audit log created in BookingStatusLog');
  const booking1 = book1Res.data;

  // TEST 2: Invalid Service
  console.log('\n--- TEST 2: Invalid Service Rejection ---');
  const invalidServiceRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: '00000000-0000-0000-0000-000000000000',
      deliveryType: 'SALON',
      appointmentDate: testDate,
      startTime: '10:00',
    }),
  }).then((r) => r.json());
  assert(invalidServiceRes.statusCode === 404, 'Returns 404 NotFound for non-existent service');

  // TEST 3: Invalid Provider / Service combination (e.g. provider not certified or home delivery mismatch)
  console.log('\n--- TEST 3: Invalid Provider / Mode Compatibility ---');
  // Fake home booking without address
  const missingAddressRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: service.id,
      deliveryType: 'HOME',
      appointmentDate: testDate,
      startTime: '14:00',
    }),
  }).then((r) => r.json());
  assert(missingAddressRes.statusCode === 400, 'Rejects HOME appointment without addressId with 400 Bad Request');

  // TEST 4: Invalid Slot (Outside Working Hours or During Lunch Break)
  console.log('\n--- TEST 4: Invalid Slot (Lunch Break 13:00 - 14:00 or After Closing) ---');
  const breakSlotRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: service.id,
      providerId: specialist.id,
      deliveryType: 'SALON',
      appointmentDate: testDate,
      startTime: '13:00', // overlaps lunch break
    }),
  }).then((r) => r.json());
  assert(breakSlotRes.statusCode === 400, 'Rejects booking overlapping with lunch break');

  // TEST 5: Provider Conflict (Double Booking Prevention)
  console.log('\n--- TEST 5: Provider Conflict (Double Booking Overlap Prevention) ---');
  // Booking 1 was 09:00 with duration 150m (+ addon 15m) -> ends ~11:45
  // Attempting to book at 09:30 must fail
  const conflictRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust2Token}` },
    body: JSON.stringify({
      serviceId: service.id,
      providerId: specialist.id,
      salonId: salon.id,
      deliveryType: 'SALON',
      appointmentDate: testDate,
      startTime: '09:30', // Overlaps with booking 1
    }),
  }).then((r) => r.json());
  assert(conflictRes.statusCode === 409, 'Rejects overlapping booking with 409 ConflictException');

  // TEST 6: Salon Workstation Capacity Conflict
  console.log('\n--- TEST 6: Salon Workstation Capacity Limit Enforcement ---');
  // Salon capacity is 12. If we temporarily create 12 bookings at 15:00, the 13th must fail.
  // We can test by setting a temporary test salon with capacity 1
  const miniSalon = await prisma.salon.create({
    data: {
      name: 'Boutique Suite Indiranagar',
      slug: `mini-salon-${Date.now()}`,
      phoneNumber: '+919999988888',
      email: `concierge.${Date.now()}@velora.luxury`,
      capacity: 1, // Only 1 workstation chair
      openingTime: '09:00',
      closingTime: '20:00',
      owner: { connect: { id: adminLoginRes.data.user.id } },
      address: {
        create: {
          label: 'Studio',
          streetLine1: '12th Main Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'IN',
        },
      },
    },
  });

  // Book 1st chair in miniSalon (09:00 - 10:00 using Hydrafacial 45m)
  const hydraService = await prisma.serviceItem.findFirst({ where: { slug: 'hydrafacial-platinum-infusion' } });
  const chair1Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: hydraService.id,
      salonId: miniSalon.id,
      deliveryType: 'SALON',
      appointmentDate: testDate,
      startTime: '15:00',
    }),
  }).then((r) => r.json());
  assert(chair1Res.success === true, 'First chair booked in capacity=1 salon');

  // Book 2nd chair simultaneously in miniSalon at 15:00 -> must fail with 409!
  const chair2Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust2Token}` },
    body: JSON.stringify({
      serviceId: hydraService.id,
      salonId: miniSalon.id,
      deliveryType: 'SALON',
      appointmentDate: testDate,
      startTime: '15:15',
    }),
  }).then((r) => r.json());
  assert(chair2Res.statusCode === 409, 'Rejects booking exceeding workstation chair capacity with 409 Conflict');

  // Clean up miniSalon bookings
  await prisma.booking.deleteMany({ where: { salonId: miniSalon.id } });
  await prisma.salon.delete({ where: { id: miniSalon.id } });

  // TEST 7: Simultaneous Concurrent Booking Attempts (CRITICAL RACE CONDITION TEST)
  console.log('\n--- TEST 7: Simultaneous Concurrent Booking Attempts (Race Condition Test) ---');
  // Two customers simultaneously submit POST /bookings for specialist on testDate at 15:00
  const [concRes1, concRes2] = await Promise.all([
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
      body: JSON.stringify({
        serviceId: hydraService.id,
        providerId: specialist.id,
        salonId: salon.id,
        deliveryType: 'SALON',
        appointmentDate: testDate,
        startTime: '16:00',
      }),
    }).then((r) => r.json()),
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust2Token}` },
      body: JSON.stringify({
        serviceId: hydraService.id,
        providerId: specialist.id,
        salonId: salon.id,
        deliveryType: 'SALON',
        appointmentDate: testDate,
        startTime: '16:00',
      }),
    }).then((r) => r.json()),
  ]);

  const successes = [concRes1, concRes2].filter((r) => r.success === true);
  const conflicts = [concRes1, concRes2].filter((r) => r.statusCode === 409);
  assert(successes.length === 1 && conflicts.length === 1, 'Transactional advisory lock allowed exactly 1 winner and 1 409 conflict during simultaneous requests');

  // TEST 8: Unauthorized Booking Access
  console.log('\n--- TEST 8: Unauthorized Booking Access / RBAC Isolation ---');
  // Cust 2 tries to access Cust 1's booking
  const unauthRes = await fetch(`${API_BASE}/bookings/${booking1.id}`, {
    headers: { Authorization: `Bearer ${cust2Token}` },
  }).then((r) => r.json());
  assert(unauthRes.statusCode === 403, 'Customer 2 receives 403 Forbidden accessing Customer 1 booking');

  // Admin CAN access Customer 1's booking
  const adminAccessRes = await fetch(`${API_BASE}/bookings/${booking1.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then((r) => r.json());
  assert(adminAccessRes.success === true, 'Admin successfully accesses booking details');

  // TEST 9 & 10: Canonical State Machine Transitions (Valid vs Invalid)
  console.log('\n--- TEST 9 & 10: Canonical State Machine Transitions ---');
  // Invalid jump: CONFIRMED -> CLOSED directly must be rejected
  const illegalJumpRes = await fetch(`${API_BASE}/bookings/${booking1.id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'CLOSED' }),
  }).then((r) => r.json());
  assert(illegalJumpRes.statusCode === 400, 'Rejects illegal jump directly to CLOSED with 400 Bad Request');

  // Valid step 1: CONFIRMED -> PROVIDER_ARRIVED (in-salon check-in)
  const arriveRes = await fetch(`${API_BASE}/bookings/${booking1.id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${specToken}` },
    body: JSON.stringify({ status: 'PROVIDER_ARRIVED', notes: 'Client checked in at station 3.' }),
  }).then((r) => r.json());
  if (!arriveRes.data) console.log('arriveRes error:', arriveRes);
  assert(arriveRes.data?.status === 'PROVIDER_ARRIVED', 'Transitioned CONFIRMED -> PROVIDER_ARRIVED');

  // Valid step 2: PROVIDER_ARRIVED -> SERVICE_STARTED
  const startRes = await fetch(`${API_BASE}/bookings/${booking1.id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${specToken}` },
    body: JSON.stringify({ status: 'SERVICE_STARTED', notes: 'Balayage formulation applied.' }),
  }).then((r) => r.json());
  assert(startRes.data.status === 'SERVICE_STARTED', 'Transitioned PROVIDER_ARRIVED -> SERVICE_STARTED');

  // Valid step 3: SERVICE_STARTED -> SERVICE_COMPLETED
  const completeRes = await fetch(`${API_BASE}/bookings/${booking1.id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${specToken}` },
    body: JSON.stringify({ status: 'SERVICE_COMPLETED', notes: 'Blowout and styling finished.' }),
  }).then((r) => r.json());
  assert(completeRes.data.status === 'SERVICE_COMPLETED', 'Transitioned SERVICE_STARTED -> SERVICE_COMPLETED');

  // Valid step 4: SERVICE_COMPLETED -> PAYMENT_COMPLETED
  const payRes = await fetch(`${API_BASE}/bookings/${booking1.id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'PAYMENT_COMPLETED', notes: 'Settled via payment transaction.' }),
  }).then((r) => r.json());
  assert(payRes.data.status === 'PAYMENT_COMPLETED', 'Transitioned SERVICE_COMPLETED -> PAYMENT_COMPLETED');

  // Valid step 5: PAYMENT_COMPLETED -> CLOSED
  const closeRes = await fetch(`${API_BASE}/bookings/${booking1.id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'CLOSED', notes: 'Appointment lifecycle finalized.' }),
  }).then((r) => r.json());
  assert(closeRes.data.status === 'CLOSED', 'Transitioned PAYMENT_COMPLETED -> CLOSED');

  // TEST 11: Cancellation Rules
  console.log('\n--- TEST 11: Cancellation Rules ---');
  // Create another booking for cancellation test
  const bookCancelRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: hydraService.id,
      providerId: specialist.id,
      salonId: salon.id,
      deliveryType: 'SALON',
      appointmentDate: '2026-10-31',
      startTime: '10:00',
    }),
  }).then((r) => r.json());
  if (!bookCancelRes.data) console.log('bookCancelRes error:', bookCancelRes);
  const cancelId = bookCancelRes.data?.id;

  // Cancel by customer
  const cancelRes = await fetch(`${API_BASE}/bookings/${cancelId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({ reason: 'Personal scheduling conflict' }),
  }).then((r) => r.json());
  assert(cancelRes.data.status === 'CANCELLED', 'Appointment cancelled successfully');
  assert(cancelRes.data.cancellationReason === 'Personal scheduling conflict', 'Cancellation reason persisted');

  // Cannot cancel already closed booking
  const cancelClosedRes = await fetch(`${API_BASE}/bookings/${booking1.id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reason: 'Too late' }),
  }).then((r) => r.json());
  assert(cancelClosedRes.statusCode === 400, 'Rejects cancellation of CLOSED booking');

  // TEST 12: Rescheduling
  console.log('\n--- TEST 12: Rescheduling with Slot Revalidation ---');
  // Create booking to reschedule
  const bookResched = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: hydraService.id,
      providerId: specialist.id,
      salonId: salon.id,
      deliveryType: 'SALON',
      appointmentDate: '2026-10-31',
      startTime: '11:00',
    }),
  }).then((r) => r.json());

  // Reschedule to 14:00 on same day
  const reschedRes = await fetch(`${API_BASE}/bookings/${bookResched.data.id}/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      appointmentDate: '2026-10-31',
      startTime: '14:00',
      reason: 'Shifted appointment after lunch',
    }),
  }).then((r) => r.json());
  assert(reschedRes.success === true, 'Rescheduled successfully');
  assert(reschedRes.data.startTime === '14:00', 'New start time updated to 14:00');
  assert(reschedRes.data.status === 'CONFIRMED', 'Booking confirmed on new slot');

  // TEST 13: No-Show Handling
  console.log('\n--- TEST 13: No-Show Handling ---');
  const bookNoShow = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cust1Token}` },
    body: JSON.stringify({
      serviceId: hydraService.id,
      providerId: specialist.id,
      salonId: salon.id,
      deliveryType: 'SALON',
      appointmentDate: '2026-10-31',
      startTime: '16:00',
    }),
  }).then((r) => r.json());

  const noShowRes = await fetch(`${API_BASE}/bookings/${bookNoShow.data.id}/no-show`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${specToken}` },
    body: JSON.stringify({ notes: 'Customer did not arrive within 30-min grace period.' }),
  }).then((r) => r.json());
  assert(noShowRes.data.status === 'NO_SHOW', 'Appointment marked as NO_SHOW by specialist');

  // TEST 14: Transition History Audit Record
  console.log('\n--- TEST 14: Transition History / Audit Trail Integrity ---');
  const fullDetailRes = await fetch(`${API_BASE}/bookings/${booking1.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then((r) => r.json());

  const history = fullDetailRes.data.statusHistory;
  assert(history.length === 6, 'Full status trail recorded 6 transitions from creation to closure');
  assert(history[0].toStatus === 'CONFIRMED', 'Audit log 0: Initial CONFIRMED');
  assert(history[1].toStatus === 'PROVIDER_ARRIVED', 'Audit log 1: PROVIDER_ARRIVED');
  assert(history[2].toStatus === 'SERVICE_STARTED', 'Audit log 2: SERVICE_STARTED');
  assert(history[3].toStatus === 'SERVICE_COMPLETED', 'Audit log 3: SERVICE_COMPLETED');
  assert(history[4].toStatus === 'PAYMENT_COMPLETED', 'Audit log 4: PAYMENT_COMPLETED');
  assert(history[5].toStatus === 'CLOSED', 'Audit log 5: CLOSED');
  assert(history[5].changedBy !== null, 'ChangedBy user ID recorded in audit trail');

  // TEST 15: Price Snapshot Integrity
  console.log('\n--- TEST 15: Price Snapshot Integrity ---');
  // Mutating the catalog price must NOT change existing booking amounts
  const originalBookingPrice = Number(fullDetailRes.data.baseAmount);
  // Temporarily edit service price in catalog
  await prisma.serviceItem.update({
    where: { id: service.id },
    data: { basePrice: 9999.00 },
  });

  const reFetchedBooking = await fetch(`${API_BASE}/bookings/${booking1.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then((r) => r.json());
  assert(Number(reFetchedBooking.data.baseAmount) === originalBookingPrice, 'Existing booking baseAmount remains unchanged after catalog price update');

  // Restore catalog price
  await prisma.serviceItem.update({
    where: { id: service.id },
    data: { basePrice: service.basePrice },
  });

  // TEST 16: Existing Phase 3-6 functionality verification
  console.log('\n--- TEST 16: Phase 3–6 Regression Verification ---');
  const catRes = await fetch(`${API_BASE}/catalog/categories`).then((r) => r.json());
  assert(catRes.success === true && catRes.data.length > 0, 'Phase 5 Catalog categories intact');

  const slotRes = await fetch(`${API_BASE}/availability/slots?date=${testDate}&serviceId=${service.id}&deliveryType=SALON`).then((r) => r.json());
  assert(slotRes.success === true, 'Phase 6 Availability slot engine intact');

  const myBookingsRes = await fetch(`${API_BASE}/bookings/my`, {
    headers: { Authorization: `Bearer ${cust1Token}` },
  }).then((r) => r.json());
  assert(myBookingsRes.success === true && myBookingsRes.data.length > 0, 'Customer booking history endpoint intact');

  console.log('\n====================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

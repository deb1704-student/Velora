import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import {
  BookingStatus,
  DayOfWeek,
  ServiceDeliveryType,
  UserRole,
} from '@velora/types';

@Injectable()
export class BookingsService {
  constructor(private readonly db: DatabaseService) {}

  // Helper to convert "HH:mm" to minutes from midnight
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper to convert minutes from midnight to "HH:mm"
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Helper to map JS getDay() to DayOfWeek enum
  private getDayOfWeekFromDate(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[date.getUTCDay()];
  }

  // Check if two intervals [s1, e1] and [s2, e2] overlap
  private intervalsOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  // Canonical Legal Transition Directed Graph
  private readonly ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.REQUESTED]: [
      BookingStatus.PENDING_ASSIGNMENT,
      BookingStatus.ASSIGNED,
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.REJECTED,
      BookingStatus.FAILED,
    ],
    [BookingStatus.PENDING_ASSIGNMENT]: [
      BookingStatus.ASSIGNED,
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.REJECTED,
      BookingStatus.FAILED,
    ],
    [BookingStatus.ASSIGNED]: [
      BookingStatus.PROVIDER_ACCEPTED,
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.REJECTED,
      BookingStatus.FAILED,
    ],
    [BookingStatus.PROVIDER_ACCEPTED]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.FAILED,
    ],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.PROVIDER_EN_ROUTE, // Home delivery only
      BookingStatus.PROVIDER_ARRIVED,   // Salon check-in
      BookingStatus.CANCELLED,
      BookingStatus.NO_SHOW,
      BookingStatus.RESCHEDULED,
      BookingStatus.FAILED,
    ],
    [BookingStatus.PROVIDER_EN_ROUTE]: [
      BookingStatus.PROVIDER_ARRIVED,
      BookingStatus.CANCELLED,
      BookingStatus.FAILED,
    ],
    [BookingStatus.PROVIDER_ARRIVED]: [
      BookingStatus.SERVICE_STARTED,
      BookingStatus.NO_SHOW,
      BookingStatus.FAILED,
    ],
    [BookingStatus.SERVICE_STARTED]: [
      BookingStatus.SERVICE_COMPLETED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.SERVICE_COMPLETED]: [
      BookingStatus.PAYMENT_COMPLETED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.PAYMENT_COMPLETED]: [
      BookingStatus.CLOSED,
      BookingStatus.REFUNDED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.CLOSED]: [
      BookingStatus.REFUNDED,
      BookingStatus.DISPUTED,
    ],
    // Terminal / Exception states
    [BookingStatus.CANCELLED]: [BookingStatus.REFUNDED],
    [BookingStatus.REJECTED]: [BookingStatus.REFUNDED],
    [BookingStatus.FAILED]: [BookingStatus.REFUNDED],
    [BookingStatus.NO_SHOW]: [BookingStatus.REFUNDED],
    [BookingStatus.RESCHEDULED]: [BookingStatus.CONFIRMED],
    [BookingStatus.DISPUTED]: [BookingStatus.REFUNDED, BookingStatus.CLOSED],
    [BookingStatus.REFUNDED]: [],
  };

  // Generate unique booking reference (e.g. VEL-20261010-8F2B)
  private generateReference(dateStr: string): string {
    const cleanDate = dateStr.replace(/[^0-9]/g, '');
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `VEL-${cleanDate}-${code}`;
  }

  // ==========================================
  // 1. TRANSACTIONALLY SAFE BOOKING CREATION
  // ==========================================

  async createBooking(
    dto: CreateBookingDto,
    requestUser: { id: string; role: UserRole }
  ) {
    if (!dto.serviceId && !dto.packageId) {
      throw new BadRequestException('Either serviceId or packageId must be provided');
    }

    // 1. Resolve Customer Profile
    let customerProfile = await this.db.client.customerProfile.findUnique({
      where: { userId: requestUser.id },
    });

    if (!customerProfile) {
      // If user has no customer profile, auto-initialize
      customerProfile = await this.db.client.customerProfile.create({
        data: { userId: requestUser.id },
      });
    }

    const targetDate = new Date(`${dto.appointmentDate}T00:00:00.000Z`);
    const dayOfWeek = this.getDayOfWeekFromDate(targetDate);
    const startMins = this.timeToMinutes(dto.startTime);

    // 2. Fetch Catalog Items & Calculate Runtime / Price Snapshots (D5)
    let service: any = null;
    let pkg: any = null;
    let basePrice = 0;
    let baseDuration = 0;
    let serviceName = '';

    if (dto.serviceId) {
      service = await this.db.client.serviceItem.findUnique({
        where: { id: dto.serviceId },
        include: {
          addons: { where: { isActive: true } },
          salonServices: dto.salonId ? { where: { salonId: dto.salonId } } : false,
        },
      });

      if (!service || !service.isActive) {
        throw new NotFoundException(`Service ${dto.serviceId} not found or inactive`);
      }

      // Delivery Type check
      if (
        service.deliveryType !== ServiceDeliveryType.BOTH &&
        service.deliveryType !== dto.deliveryType
      ) {
        throw new BadRequestException(
          `Service "${service.name}" only accepts ${service.deliveryType} appointments`
        );
      }

      serviceName = service.name;
      baseDuration = service.durationMinutes;

      // Price override check: if salon has a specific price override
      if (dto.salonId && service.salonServices && service.salonServices.length > 0) {
        basePrice = Number(service.salonServices[0].customPrice);
        if (service.salonServices[0].customDurationMinutes) {
          baseDuration = service.salonServices[0].customDurationMinutes;
        }
      } else {
        basePrice = Number(service.basePrice);
      }
    } else if (dto.packageId) {
      pkg = await this.db.client.servicePackage.findUnique({
        where: { id: dto.packageId },
        include: { items: { include: { service: true } } },
      });

      if (!pkg || !pkg.isActive) {
        throw new NotFoundException(`Package ${dto.packageId} not found or inactive`);
      }

      serviceName = pkg.name;
      basePrice = Number(pkg.price);
      baseDuration = pkg.durationMinutes;
    }

    // 3. Process Add-on Boosters
    let addonsPrice = 0;
    let addonsExtraDuration = 0;
    const validatedAddons: Array<{ id: string; price: number }> = [];

    if (dto.addonIds && dto.addonIds.length > 0 && service) {
      const activeAddons = await this.db.client.serviceAddon.findMany({
        where: {
          id: { in: dto.addonIds },
          serviceId: service.id,
          isActive: true,
        },
      });

      for (const addon of activeAddons) {
        addonsPrice += Number(addon.price);
        addonsExtraDuration += addon.extraDurationMinutes;
        validatedAddons.push({ id: addon.id, price: Number(addon.price) });
      }
    }

    const totalDuration = baseDuration + addonsExtraDuration;
    const turnaroundBuffer = 15; // 15 mins prep/sanitization buffer between bookings
    const endMins = startMins + totalDuration;
    const endTime = this.minutesToTime(endMins);

    // 4. Validate Delivery Details
    if (dto.deliveryType === ServiceDeliveryType.HOME) {
      if (!dto.addressId) {
        throw new BadRequestException('addressId is required for at-home appointments');
      }
      const address = await this.db.client.address.findUnique({
        where: { id: dto.addressId },
      });
      if (!address) {
        throw new NotFoundException(`Address ${dto.addressId} not found`);
      }
    }

    // 5. Pre-validate Provider if specified
    if (dto.providerId) {
      const provider = await this.db.client.providerProfile.findUnique({
        where: { id: dto.providerId },
        include: { user: true },
      });

      if (!provider || !provider.isActive || provider.verificationStatus !== 'APPROVED') {
        throw new BadRequestException('Selected specialist is not accredited or active');
      }

      if (dto.deliveryType === ServiceDeliveryType.HOME && !provider.isHomeServiceAvailable) {
        throw new BadRequestException('Specialist does not offer at-home service consultations');
      }

      if (dto.deliveryType === ServiceDeliveryType.SALON && !provider.isSalonServiceAvailable) {
        throw new BadRequestException('Specialist does not accept salon chair appointments');
      }

      // Check if provider is certified for this service
      if (dto.serviceId) {
        const cert = await this.db.client.providerService.findUnique({
          where: {
            providerId_serviceId: {
              providerId: dto.providerId,
              serviceId: dto.serviceId,
            },
          },
        });
        // If certification table has records, verify certification
        const totalCerts = await this.db.client.providerService.count({
          where: { providerId: dto.providerId },
        });
        if (totalCerts > 0 && (!cert || !cert.isCertified)) {
          throw new BadRequestException(
            `Specialist ${provider.user.firstName} is not certified for this procedure`
          );
        }
      }
    }

    // 6. Pre-validate Salon if specified
    if (dto.salonId) {
      const salon = await this.db.client.salon.findUnique({
        where: { id: dto.salonId },
      });
      if (!salon || !salon.isActive) {
        throw new NotFoundException(`Salon ${dto.salonId} is inactive or not found`);
      }
    }

    // Calculate Financial Snapshot
    const subtotal = basePrice + addonsPrice;
    const taxAmount = Math.round(subtotal * 0.18); // 18% GST standard
    const platformFee = 50; // Flat platform reservation fee
    const totalAmount = subtotal + taxAmount + platformFee;

    // 7. TRANSACTIONAL SLOT LOCK & CONFLICT REVALIDATION
    // Executed inside an interactive database transaction with transaction-scoped advisory locks
    return this.db.client.$transaction(async (tx) => {
      // A. Acquire concurrency lock in PostgreSQL
      if (dto.providerId) {
        await tx.$executeRawUnsafe(
          `SELECT pg_advisory_xact_lock(hashtext('booking_prov_' || $1 || '_' || $2))`,
          dto.providerId,
          dto.appointmentDate
        );
      }
      if (dto.salonId) {
        await tx.$executeRawUnsafe(
          `SELECT pg_advisory_xact_lock(hashtext('booking_salon_' || $1 || '_' || $2))`,
          dto.salonId,
          dto.appointmentDate
        );
      }

      // B. Conflict Check 1: Provider Schedule & Leaves
      if (dto.providerId) {
        // Shift check
        const schedule = await tx.providerSchedule.findUnique({
          where: {
            providerId_dayOfWeek: {
              providerId: dto.providerId,
              dayOfWeek,
            },
          },
        });

        if (!schedule || !schedule.isActive) {
          throw new BadRequestException(
            `Specialist does not work on ${dayOfWeek}`
          );
        }

        const shiftStart = this.timeToMinutes(schedule.startTime);
        const shiftEnd = this.timeToMinutes(schedule.endTime);

        if (startMins < shiftStart || endMins > shiftEnd) {
          throw new BadRequestException(
            `Appointment window (${dto.startTime}–${endTime}) is outside specialist working hours (${schedule.startTime}–${schedule.endTime})`
          );
        }

        // Shift break check
        if (schedule.breakStartTime && schedule.breakEndTime) {
          const breakStart = this.timeToMinutes(schedule.breakStartTime);
          const breakEnd = this.timeToMinutes(schedule.breakEndTime);
          if (this.intervalsOverlap(startMins, endMins, breakStart, breakEnd)) {
            throw new BadRequestException(
              `Appointment overlaps with scheduled specialist break (${schedule.breakStartTime}–${schedule.breakEndTime})`
            );
          }
        }

        // Time off check
        const timeOffs = await tx.providerTimeOff.findMany({
          where: {
            providerId: dto.providerId,
            startDate: { lte: targetDate },
            endDate: { gte: targetDate },
          },
        });

        for (const leave of timeOffs) {
          if (!leave.startTime || !leave.endTime) {
            // Full day leave
            throw new ConflictException(
              'Specialist is on leave and unavailable for booking on this date'
            );
          } else {
            const leaveStart = this.timeToMinutes(leave.startTime);
            const leaveEnd = this.timeToMinutes(leave.endTime);
            if (this.intervalsOverlap(startMins, endMins, leaveStart, leaveEnd)) {
              throw new ConflictException(
                `Specialist has a scheduled block (${leave.startTime}–${leave.endTime})`
              );
            }
          }
        }

        // Existing booking overlap check
        const existingBookings = await tx.booking.findMany({
          where: {
            providerId: dto.providerId,
            appointmentDate: targetDate,
            status: { notIn: ['CANCELLED', 'REJECTED', 'REFUNDED'] },
          },
          select: { id: true, startTime: true, endTime: true, bookingReference: true },
        });

        for (const existing of existingBookings) {
          const existStart = this.timeToMinutes(existing.startTime);
          const existEnd = this.timeToMinutes(existing.endTime) + turnaroundBuffer;

          if (this.intervalsOverlap(startMins, endMins, existStart, existEnd)) {
            throw new ConflictException(
              `This appointment slot (${dto.startTime}–${endTime}) has already been reserved. Please select another time window.`
            );
          }
        }
      }

      // C. Conflict Check 2: Salon Workstation Capacity
      if (dto.salonId) {
        const salon = await tx.salon.findUnique({
          where: { id: dto.salonId },
          select: { capacity: true, openingTime: true, closingTime: true },
        });

        if (salon) {
          const salonOpen = this.timeToMinutes(salon.openingTime);
          const salonClose = this.timeToMinutes(salon.closingTime);

          if (startMins < salonOpen || endMins > salonClose) {
            throw new BadRequestException(
              `Appointment time is outside salon operating hours (${salon.openingTime}–${salon.closingTime})`
            );
          }

          const salonBookings = await tx.booking.findMany({
            where: {
              salonId: dto.salonId,
              appointmentDate: targetDate,
              status: { notIn: ['CANCELLED', 'REJECTED', 'REFUNDED'] },
            },
            select: { startTime: true, endTime: true },
          });

          // Check concurrent workstation occupancy every 15 minutes across appointment
          let maxOccupied = 0;
          for (let m = startMins; m < endMins; m += 15) {
            const count = salonBookings.filter((b) =>
              this.intervalsOverlap(
                m,
                m + 15,
                this.timeToMinutes(b.startTime),
                this.timeToMinutes(b.endTime)
              )
            ).length;
            if (count > maxOccupied) maxOccupied = count;
          }

          if (maxOccupied >= salon.capacity) {
            throw new ConflictException(
              `Salon workstation capacity (${salon.capacity} chairs) is fully reserved during this time.`
            );
          }
        }
      }

      // D. Generate Reference & Initial Status
      let bookingReference = this.generateReference(dto.appointmentDate);
      // Ensure reference is unique
      let refCollision = await tx.booking.findUnique({ where: { bookingReference } });
      while (refCollision) {
        bookingReference = this.generateReference(dto.appointmentDate);
        refCollision = await tx.booking.findUnique({ where: { bookingReference } });
      }

      // Initial status: if a certified specialist is directly assigned and available -> CONFIRMED, else REQUESTED
      const initialStatus = dto.providerId ? BookingStatus.CONFIRMED : BookingStatus.REQUESTED;

      // E. Create Booking Record with catalog price snapshot
      const createdBooking = await tx.booking.create({
        data: {
          bookingReference,
          customerId: customerProfile.id,
          serviceId: dto.serviceId || null,
          packageId: dto.packageId || null,
          salonId: dto.salonId || null,
          providerId: dto.providerId || null,
          deliveryType: dto.deliveryType,
          addressId: dto.addressId || null,
          appointmentDate: targetDate,
          startTime: dto.startTime,
          endTime,
          status: initialStatus,
          baseAmount: basePrice,
          addonsAmount: addonsPrice,
          taxAmount,
          platformFee,
          totalAmount,
          customerNotes: dto.customerNotes || null,
        },
      });

      // F. Create Snapshotted Addons
      if (validatedAddons.length > 0) {
        await tx.bookingAddon.createMany({
          data: validatedAddons.map((addon) => ({
            bookingId: createdBooking.id,
            addonId: addon.id,
            price: addon.price,
          })),
        });
      }

      // G. Record Initial Status Transition in Audit Log
      await tx.bookingStatusLog.create({
        data: {
          bookingId: createdBooking.id,
          fromStatus: null,
          toStatus: initialStatus,
          changedBy: requestUser.id,
          reason: 'Initial appointment booking',
          notes: `Slot verified & locked: ${dto.startTime}–${endTime} (${totalDuration} mins runtime).`,
          metadata: {
            serviceName,
            basePrice,
            addonsPrice,
            totalAmount,
            deliveryType: dto.deliveryType,
          },
        },
      });

      return tx.booking.findUnique({
        where: { id: createdBooking.id },
        include: {
          service: true,
          package: true,
          salon: { include: { address: true } },
          provider: { include: { user: true } },
          customer: { include: { user: true } },
          address: true,
          selectedAddons: { include: { addon: true } },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
    });
  }

  // ==========================================
  // 2. STATE MACHINE TRANSITIONS (VALIDATED)
  // ==========================================

  async transitionStatus(
    bookingId: string,
    dto: TransitionStatusDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const booking = await this.db.client.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: true,
        salon: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    const currentStatus = booking.status as unknown as BookingStatus;
    const targetStatus = dto.status;

    // 1. Graph edge validation
    const allowedTargets = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Illegal state transition: Cannot transition booking from ${currentStatus} to ${targetStatus}`
      );
    }

    // 2. Delivery Type constraint for PROVIDER_EN_ROUTE
    if (
      targetStatus === BookingStatus.PROVIDER_EN_ROUTE &&
      booking.deliveryType !== ServiceDeliveryType.HOME
    ) {
      throw new BadRequestException(
        'PROVIDER_EN_ROUTE status is only applicable to at-home service appointments'
      );
    }

    // 3. RBAC & Actor Authorization validation
    const isCustomer = booking.customer.userId === requestUser.id;
    const isAssignedProvider =
      booking.provider && booking.provider.userId === requestUser.id;
    const isSalonOwner =
      booking.salon && booking.salon.ownerId === requestUser.id;
    const isAdmin =
      requestUser.role === UserRole.ADMIN ||
      requestUser.role === UserRole.SUPER_ADMIN;
    const isFinance = requestUser.role === UserRole.FINANCE_ADMIN;

    if (!isAdmin) {
      if (isCustomer) {
        // Customer can only cancel prior to service start, or dispute
        if (
          targetStatus !== BookingStatus.CANCELLED &&
          targetStatus !== BookingStatus.DISPUTED
        ) {
          throw new ForbiddenException(
            `Customers are not authorized to transition booking to ${targetStatus}`
          );
        }
      } else if (isAssignedProvider) {
        // Provider can accept, confirm, en route, arrive, start, complete, no show, reject
        const providerAllowed = [
          BookingStatus.PROVIDER_ACCEPTED,
          BookingStatus.CONFIRMED,
          BookingStatus.PROVIDER_EN_ROUTE,
          BookingStatus.PROVIDER_ARRIVED,
          BookingStatus.SERVICE_STARTED,
          BookingStatus.SERVICE_COMPLETED,
          BookingStatus.NO_SHOW,
          BookingStatus.REJECTED,
          BookingStatus.CANCELLED,
        ];
        if (!providerAllowed.includes(targetStatus)) {
          throw new ForbiddenException(
            `Specialists cannot transition booking to ${targetStatus}`
          );
        }
      } else if (isSalonOwner) {
        // Salon manager can assign, check-in, complete, close, no-show
        const salonAllowed = [
          BookingStatus.ASSIGNED,
          BookingStatus.CONFIRMED,
          BookingStatus.PROVIDER_ARRIVED,
          BookingStatus.SERVICE_STARTED,
          BookingStatus.SERVICE_COMPLETED,
          BookingStatus.PAYMENT_COMPLETED,
          BookingStatus.CLOSED,
          BookingStatus.NO_SHOW,
          BookingStatus.CANCELLED,
        ];
        if (!salonAllowed.includes(targetStatus)) {
          throw new ForbiddenException(
            `Salon partners cannot transition booking to ${targetStatus}`
          );
        }
      } else if (isFinance) {
        if (
          targetStatus !== BookingStatus.PAYMENT_COMPLETED &&
          targetStatus !== BookingStatus.REFUNDED
        ) {
          throw new ForbiddenException(
            'Finance administrators can only execute payment and refund transitions'
          );
        }
      } else {
        throw new ForbiddenException('You do not have permission to manage this booking');
      }
    }

    // 4. Execute transition in transaction with status audit record
    await this.db.client.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: targetStatus,
          ...(targetStatus === BookingStatus.CANCELLED && dto.reason
            ? { cancellationReason: dto.reason }
            : {}),
        },
      });

      await tx.bookingStatusLog.create({
        data: {
          bookingId,
          fromStatus: currentStatus,
          toStatus: targetStatus,
          changedBy: requestUser.id,
          reason: dto.reason || null,
          notes: dto.notes || `Transitioned from ${currentStatus} to ${targetStatus}`,
          metadata: dto.metadata ? (dto.metadata as any) : undefined,
        },
      });
    });

    return this.getBookingById(bookingId, requestUser);
  }

  // ==========================================
  // 3. APPOINTMENT CANCELLATION
  // ==========================================

  async cancelBooking(
    bookingId: string,
    dto: CancelBookingDto,
    requestUser: { id: string; role: UserRole }
  ) {
    return this.transitionStatus(
      bookingId,
      {
        status: BookingStatus.CANCELLED,
        reason: dto.reason,
        notes: dto.notes || 'Appointment cancelled',
      },
      requestUser
    );
  }

  // ==========================================
  // 4. APPOINTMENT RESCHEDULING
  // ==========================================

  async rescheduleBooking(
    bookingId: string,
    dto: RescheduleBookingDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const booking = await this.db.client.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, provider: true, salon: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    // Rescheduling allowed only before service starts
    const reschedulableStates = [
      BookingStatus.REQUESTED,
      BookingStatus.PENDING_ASSIGNMENT,
      BookingStatus.ASSIGNED,
      BookingStatus.PROVIDER_ACCEPTED,
      BookingStatus.CONFIRMED,
    ];

    if (!reschedulableStates.includes(booking.status as unknown as BookingStatus)) {
      throw new BadRequestException(
        `Cannot reschedule booking in ${booking.status} state. Rescheduling is only permitted prior to service commencement.`
      );
    }

    // Check ownership
    const isCustomer = booking.customer.userId === requestUser.id;
    const isProvider = booking.provider && booking.provider.userId === requestUser.id;
    const isSalon = booking.salon && booking.salon.ownerId === requestUser.id;
    const isAdmin =
      requestUser.role === UserRole.ADMIN ||
      requestUser.role === UserRole.SUPER_ADMIN;

    if (!isCustomer && !isProvider && !isSalon && !isAdmin) {
      throw new ForbiddenException('Not authorized to reschedule this appointment');
    }

    const newTargetDate = new Date(`${dto.appointmentDate}T00:00:00.000Z`);
    const newDayOfWeek = this.getDayOfWeekFromDate(newTargetDate);
    const newStartMins = this.timeToMinutes(dto.startTime);

    // Calculate runtime from original booking
    const originalStartMins = this.timeToMinutes(booking.startTime);
    const originalEndMins = this.timeToMinutes(booking.endTime);
    const runtime = originalEndMins - originalStartMins;
    const newEndMins = newStartMins + runtime;
    const newEndTime = this.minutesToTime(newEndMins);
    const turnaroundBuffer = 15;

    // Validate new slot inside transaction with lock
    await this.db.client.$transaction(async (tx) => {
      if (booking.providerId) {
        await tx.$executeRawUnsafe(
          `SELECT pg_advisory_xact_lock(hashtext('booking_prov_' || $1 || '_' || $2))`,
          booking.providerId,
          dto.appointmentDate
        );

        // Schedule check
        const schedule = await tx.providerSchedule.findUnique({
          where: {
            providerId_dayOfWeek: {
              providerId: booking.providerId,
              dayOfWeek: newDayOfWeek,
            },
          },
        });

        if (!schedule || !schedule.isActive) {
          throw new BadRequestException(
            `Specialist does not work on ${newDayOfWeek}`
          );
        }

        const shiftStart = this.timeToMinutes(schedule.startTime);
        const shiftEnd = this.timeToMinutes(schedule.endTime);

        if (newStartMins < shiftStart || newEndMins > shiftEnd) {
          throw new BadRequestException(
            `Requested time (${dto.startTime}–${newEndTime}) is outside specialist working hours (${schedule.startTime}–${schedule.endTime})`
          );
        }

        // Break check
        if (schedule.breakStartTime && schedule.breakEndTime) {
          const bStart = this.timeToMinutes(schedule.breakStartTime);
          const bEnd = this.timeToMinutes(schedule.breakEndTime);
          if (this.intervalsOverlap(newStartMins, newEndMins, bStart, bEnd)) {
            throw new BadRequestException('Requested time overlaps with specialist lunch break');
          }
        }

        // Leave check
        const leaves = await tx.providerTimeOff.findMany({
          where: {
            providerId: booking.providerId,
            startDate: { lte: newTargetDate },
            endDate: { gte: newTargetDate },
          },
        });

        if (leaves.length > 0) {
          throw new ConflictException('Specialist is on leave on the requested date');
        }

        // Overlapping bookings check (exclude self)
        const overlaps = await tx.booking.findMany({
          where: {
            providerId: booking.providerId,
            appointmentDate: newTargetDate,
            id: { not: bookingId },
            status: { notIn: ['CANCELLED', 'REJECTED', 'REFUNDED'] },
          },
          select: { startTime: true, endTime: true },
        });

        for (const ov of overlaps) {
          const s = this.timeToMinutes(ov.startTime);
          const e = this.timeToMinutes(ov.endTime) + turnaroundBuffer;
          if (this.intervalsOverlap(newStartMins, newEndMins, s, e)) {
            throw new ConflictException(
              `The specialist is already reserved at ${dto.startTime}. Please select another slot.`
            );
          }
        }
      }

      // Record state history: Rescheduled
      await tx.bookingStatusLog.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: BookingStatus.RESCHEDULED,
          changedBy: requestUser.id,
          reason: dto.reason || 'Client rescheduled appointment',
          notes: `Rescheduled from ${booking.appointmentDate.toISOString().split('T')[0]} ${booking.startTime} to ${dto.appointmentDate} ${dto.startTime}`,
        },
      });

      // Update booking to new date & time with CONFIRMED state
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          appointmentDate: newTargetDate,
          startTime: dto.startTime,
          endTime: newEndTime,
          status: BookingStatus.CONFIRMED,
        },
      });

      await tx.bookingStatusLog.create({
        data: {
          bookingId,
          fromStatus: BookingStatus.RESCHEDULED,
          toStatus: BookingStatus.CONFIRMED,
          changedBy: requestUser.id,
          reason: 'Rescheduled slot confirmed',
          notes: `New confirmed appointment window: ${dto.appointmentDate} at ${dto.startTime}–${newEndTime}`,
        },
      });
    });

    return this.getBookingById(bookingId, requestUser);
  }

  // ==========================================
  // 5. ROLE-SCOPED BOOKINGS QUERY
  // ==========================================

  async listBookings(
    query: QueryBookingsDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const where: any = {};

    // Role-based scope filters
    if (requestUser.role === UserRole.CUSTOMER) {
      where.customer = { userId: requestUser.id };
    } else if (requestUser.role === UserRole.PROVIDER) {
      where.provider = { userId: requestUser.id };
    } else if (
      requestUser.role === UserRole.SALON_OWNER ||
      requestUser.role === UserRole.SALON_MANAGER
    ) {
      // Find salons owned or managed by this user
      const ownedSalons = await this.db.client.salon.findMany({
        where: { ownerId: requestUser.id },
        select: { id: true },
      });
      where.salonId = { in: ownedSalons.map((s) => s.id) };
    }

    // Query DTO filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.deliveryType) {
      where.deliveryType = query.deliveryType;
    }

    if (query.salonId) {
      where.salonId = query.salonId;
    }

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.startDate || query.endDate) {
      where.appointmentDate = {};
      if (query.startDate) {
        where.appointmentDate.gte = new Date(`${query.startDate}T00:00:00.000Z`);
      }
      if (query.endDate) {
        where.appointmentDate.lte = new Date(`${query.endDate}T23:59:59.999Z`);
      }
    }

    if (query.search) {
      where.OR = [
        { bookingReference: { contains: query.search, mode: 'insensitive' } },
        { service: { name: { contains: query.search, mode: 'insensitive' } } },
        {
          customer: {
            user: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
      this.db.client.booking.count({ where }),
      this.db.client.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appointmentDate: 'desc' },
        include: {
          service: true,
          package: true,
          salon: { select: { id: true, name: true, slug: true } },
          provider: {
            select: {
              id: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
          customer: {
            select: {
              id: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          selectedAddons: { include: { addon: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // 6. BOOKING DETAIL WITH STATUS AUDIT TRAIL
  // ==========================================

  async getBookingById(
    bookingId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    const booking = await this.db.client.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        package: true,
        salon: { include: { address: true } },
        provider: { include: { user: true } },
        customer: { include: { user: true } },
        address: true,
        selectedAddons: { include: { addon: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    // RBAC access check
    const isCustomer = booking.customer.userId === requestUser.id;
    const isProvider = booking.provider && booking.provider.userId === requestUser.id;
    const isSalon = booking.salon && booking.salon.ownerId === requestUser.id;
    const isAdmin =
      requestUser.role === UserRole.ADMIN ||
      requestUser.role === UserRole.SUPER_ADMIN ||
      requestUser.role === UserRole.SUPPORT_AGENT ||
      requestUser.role === UserRole.FINANCE_ADMIN;

    if (!isCustomer && !isProvider && !isSalon && !isAdmin) {
      throw new ForbiddenException('Access denied to this booking');
    }

    return booking;
  }
}

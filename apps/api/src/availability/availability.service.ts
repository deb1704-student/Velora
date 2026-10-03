import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SetWeeklyScheduleDto } from './dto/set-schedule.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { DayOfWeek, ServiceDeliveryType, UserRole } from '@velora/types';

@Injectable()
export class AvailabilityService {
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

  // Helper to map JS getDay() (0 = Sunday, 1 = Monday...) to DayOfWeek enum
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

  // Check if two time intervals [s1, e1] and [s2, e2] overlap
  private intervalsOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  // ==========================================
  // 1. PROVIDER SCHEDULE MANAGEMENT
  // ==========================================

  async getProviderSchedule(providerId: string) {
    const provider = await this.db.client.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        timeOffEntries: {
          where: { endDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`Provider ${providerId} not found`);
    }

    return {
      providerId: provider.id,
      schedules: provider.schedules,
      upcomingTimeOff: provider.timeOffEntries,
    };
  }

  async setWeeklySchedule(
    providerId: string,
    dto: SetWeeklyScheduleDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const provider = await this.db.client.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      throw new NotFoundException(`Provider ${providerId} not found`);
    }

    if (
      requestUser.role !== UserRole.ADMIN &&
      requestUser.role !== UserRole.SUPER_ADMIN &&
      provider.userId !== requestUser.id
    ) {
      throw new ForbiddenException('You can only update your own schedule');
    }

    // Upsert each day schedule
    const operations = dto.schedules.map((sched) => {
      return this.db.client.providerSchedule.upsert({
        where: {
          providerId_dayOfWeek: {
            providerId,
            dayOfWeek: sched.dayOfWeek,
          },
        },
        update: {
          startTime: sched.startTime,
          endTime: sched.endTime,
          breakStartTime: sched.breakStartTime,
          breakEndTime: sched.breakEndTime,
          isActive: sched.isActive ?? true,
        },
        create: {
          providerId,
          dayOfWeek: sched.dayOfWeek,
          startTime: sched.startTime,
          endTime: sched.endTime,
          breakStartTime: sched.breakStartTime,
          breakEndTime: sched.breakEndTime,
          isActive: sched.isActive ?? true,
        },
      });
    });

    await this.db.client.$transaction(operations);

    return this.getProviderSchedule(providerId);
  }

  // ==========================================
  // 2. TIME OFF & BLOCKED INTERVALS
  // ==========================================

  async createTimeOff(
    providerId: string,
    dto: CreateTimeOffDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const provider = await this.db.client.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      throw new NotFoundException(`Provider ${providerId} not found`);
    }

    if (
      requestUser.role !== UserRole.ADMIN &&
      requestUser.role !== UserRole.SUPER_ADMIN &&
      provider.userId !== requestUser.id
    ) {
      throw new ForbiddenException('You can only register time-off for yourself');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('endDate cannot precede startDate');
    }

    return this.db.client.providerTimeOff.create({
      data: {
        providerId,
        startDate,
        endDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
      },
    });
  }

  async getProviderTimeOff(providerId: string) {
    return this.db.client.providerTimeOff.findMany({
      where: { providerId },
      orderBy: { startDate: 'desc' },
    });
  }

  async deleteTimeOff(
    timeOffId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    const entry = await this.db.client.providerTimeOff.findUnique({
      where: { id: timeOffId },
      include: { provider: true },
    });
    if (!entry) {
      throw new NotFoundException(`Time off record ${timeOffId} not found`);
    }

    if (
      requestUser.role !== UserRole.ADMIN &&
      requestUser.role !== UserRole.SUPER_ADMIN &&
      entry.provider.userId !== requestUser.id
    ) {
      throw new ForbiddenException('You cannot delete another provider’s time off');
    }

    await this.db.client.providerTimeOff.delete({ where: { id: timeOffId } });
    return { success: true, message: 'Time off cancelled' };
  }

  // ==========================================
  // 3. CORE SLOT GENERATION ENGINE (D6)
  // ==========================================

  async findAvailableSlots(query: QuerySlotsDto) {
    const targetDate = new Date(`${query.date}T00:00:00.000Z`);
    const dayOfWeek = this.getDayOfWeekFromDate(targetDate);

    // 1. Verify Service Item
    const service = await this.db.client.serviceItem.findUnique({
      where: { id: query.serviceId },
      include: { addons: { where: { isActive: true } } },
    });

    if (!service || !service.isActive) {
      throw new NotFoundException(`Service ${query.serviceId} is not available in catalog`);
    }

    // Check delivery type compatibility
    if (
      service.deliveryType !== ServiceDeliveryType.BOTH &&
      service.deliveryType !== query.deliveryType
    ) {
      throw new BadRequestException(
        `This service is only offered for ${service.deliveryType} appointments`
      );
    }

    const serviceDuration = service.durationMinutes;
    const turnaroundBuffer = 15; // 15 mins prep/sanitization buffer between bookings
    const totalSlotLength = serviceDuration + turnaroundBuffer;

    // 2. Fetch Salon if specified
    let salon: any = null;
    if (query.salonId) {
      salon = await this.db.client.salon.findUnique({
        where: { id: query.salonId },
        include: { address: true },
      });
      if (!salon || !salon.isActive) {
        throw new NotFoundException(`Salon ${query.salonId} not found or inactive`);
      }
    }

    // 3. Determine Candidate Providers
    const providerWhere: any = {
      isActive: true,
      verificationStatus: 'APPROVED',
    };

    if (query.deliveryType === ServiceDeliveryType.HOME) {
      providerWhere.isHomeServiceAvailable = true;
    } else if (query.deliveryType === ServiceDeliveryType.SALON) {
      providerWhere.isSalonServiceAvailable = true;
      if (query.salonId) {
        providerWhere.salonId = query.salonId;
      }
    }

    if (query.providerId) {
      providerWhere.id = query.providerId;
    }

    const candidateProviders = await this.db.client.providerProfile.findMany({
      where: providerWhere,
      include: {
        user: { select: { firstName: true, lastName: true } },
        schedules: {
          where: { dayOfWeek, isActive: true },
        },
        timeOffEntries: {
          where: {
            startDate: { lte: targetDate },
            endDate: { gte: targetDate },
          },
        },
      },
    });

    // 4. Fetch existing active bookings for that date (excluding cancelled/rejected)
    const existingBookings = await this.db.client.booking.findMany({
      where: {
        appointmentDate: targetDate,
        status: { notIn: ['CANCELLED', 'REJECTED', 'REFUNDED'] },
        ...(query.salonId && { salonId: query.salonId }),
      },
      select: {
        id: true,
        providerId: true,
        salonId: true,
        startTime: true,
        endTime: true,
      },
    });

    const availableSlots: Array<{
      startTime: string;
      endTime: string;
      providerId: string;
      providerName: string;
      salonId?: string;
      salonName?: string;
      deliveryType: ServiceDeliveryType;
      availableChairs?: number;
    }> = [];

    // Calculate salon opening window if applicable
    const salonOpenMinutes = salon ? this.timeToMinutes(salon.openingTime) : 9 * 60;
    const salonCloseMinutes = salon ? this.timeToMinutes(salon.closingTime) : 21 * 60;

    // 5. Generate slots for each candidate provider
    for (const provider of candidateProviders) {
      const schedule = provider.schedules[0];
      if (!schedule) continue; // Provider doesn't work on this day

      // Check full-day time-off
      const fullDayTimeOff = provider.timeOffEntries.find(
        (t) => !t.startTime && !t.endTime
      );
      if (fullDayTimeOff) continue;

      const providerShiftStart = this.timeToMinutes(schedule.startTime);
      const providerShiftEnd = this.timeToMinutes(schedule.endTime);

      const breakStart = schedule.breakStartTime
        ? this.timeToMinutes(schedule.breakStartTime)
        : null;
      const breakEnd = schedule.breakEndTime
        ? this.timeToMinutes(schedule.breakEndTime)
        : null;

      // Provider's existing bookings on that date
      const providerBookings = existingBookings.filter(
        (b) => b.providerId === provider.id
      );

      // Candidate start boundaries: effective window is intersection of provider shift and salon hours
      const effectiveStart = Math.max(providerShiftStart, salonOpenMinutes);
      const effectiveEnd = Math.min(providerShiftEnd, salonCloseMinutes);

      // Iterate in 30-minute intervals
      for (
        let slotStart = effectiveStart;
        slotStart + serviceDuration <= effectiveEnd;
        slotStart += 30
      ) {
        const slotEnd = slotStart + serviceDuration;
        const slotWithBufferEnd = slotStart + totalSlotLength;

        // Check 1: Provider break collision
        if (
          breakStart !== null &&
          breakEnd !== null &&
          this.intervalsOverlap(slotStart, slotWithBufferEnd, breakStart, breakEnd)
        ) {
          continue;
        }

        // Check 2: Provider partial time-off collision
        const partialTimeOffCollision = provider.timeOffEntries.some((t) => {
          if (t.startTime && t.endTime) {
            const tStart = this.timeToMinutes(t.startTime);
            const tEnd = this.timeToMinutes(t.endTime);
            return this.intervalsOverlap(slotStart, slotWithBufferEnd, tStart, tEnd);
          }
          return false;
        });
        if (partialTimeOffCollision) continue;

        // Check 3: Provider existing appointment collision
        const providerBookingCollision = providerBookings.some((b) => {
          const bStart = this.timeToMinutes(b.startTime);
          const bEnd = this.timeToMinutes(b.endTime);
          return this.intervalsOverlap(slotStart, slotWithBufferEnd, bStart, bEnd);
        });
        if (providerBookingCollision) continue;

        // Check 4: Salon workstation capacity constraint (if salon appointment)
        let availableChairs: number | undefined;
        if (salon) {
          const concurrentAtSalon = existingBookings.filter((b) => {
            if (b.salonId !== salon.id) return false;
            const bStart = this.timeToMinutes(b.startTime);
            const bEnd = this.timeToMinutes(b.endTime);
            return this.intervalsOverlap(slotStart, slotEnd, bStart, bEnd);
          }).length;

          availableChairs = salon.capacity - concurrentAtSalon;
          if (availableChairs <= 0) {
            continue; // Salon fully booked at this time
          }
        }

        availableSlots.push({
          startTime: this.minutesToTime(slotStart),
          endTime: this.minutesToTime(slotEnd),
          providerId: provider.id,
          providerName: `${provider.user.firstName} ${provider.user.lastName}`,
          salonId: salon?.id,
          salonName: salon?.name,
          deliveryType: query.deliveryType,
          availableChairs,
        });
      }
    }

    // Sort slots chronologically
    availableSlots.sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

    return {
      date: query.date,
      dayOfWeek,
      service: {
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        basePrice: service.basePrice,
      },
      deliveryType: query.deliveryType,
      totalSlots: availableSlots.length,
      slots: availableSlots,
    };
  }

  // ==========================================
  // 4. SALON WORKSTATION CAPACITY AUDIT
  // ==========================================

  async getSalonUtilization(salonId: string, dateStr: string) {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    const salon = await this.db.client.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException(`Salon ${salonId} not found`);
    }

    const bookings = await this.db.client.booking.findMany({
      where: {
        salonId,
        appointmentDate: targetDate,
        status: { notIn: ['CANCELLED', 'REJECTED', 'REFUNDED'] },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    const openMinutes = this.timeToMinutes(salon.openingTime);
    const closeMinutes = this.timeToMinutes(salon.closingTime);

    const hourlyBreakdown: Array<{
      hour: string;
      occupiedChairs: number;
      availableChairs: number;
      capacity: number;
      utilizationPercentage: number;
    }> = [];

    for (let m = openMinutes; m < closeMinutes; m += 60) {
      const hStart = m;
      const hEnd = m + 60;

      const occupied = bookings.filter((b) => {
        const bStart = this.timeToMinutes(b.startTime);
        const bEnd = this.timeToMinutes(b.endTime);
        return this.intervalsOverlap(hStart, hEnd, bStart, bEnd);
      }).length;

      const available = Math.max(0, salon.capacity - occupied);
      const utilPct = Math.min(100, Math.round((occupied / salon.capacity) * 100));

      hourlyBreakdown.push({
        hour: `${this.minutesToTime(hStart)} - ${this.minutesToTime(hEnd)}`,
        occupiedChairs: occupied,
        availableChairs: available,
        capacity: salon.capacity,
        utilizationPercentage: utilPct,
      });
    }

    return {
      salonId: salon.id,
      salonName: salon.name,
      capacity: salon.capacity,
      date: dateStr,
      hourlyBreakdown,
    };
  }
}

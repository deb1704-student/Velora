import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { VerifySalonDto } from './dto/verify-salon.dto';
import { AddSalonStaffDto } from './dto/add-salon-staff.dto';
import { SalonVerificationStatus, UserRole } from '@velora/types';

@Injectable()
export class SalonsService {
  constructor(private readonly db: DatabaseService) {}

  async create(ownerId: string, dto: CreateSalonDto) {
    let slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingSlug = await this.db.client.salon.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const salon = await this.db.client.$transaction(async (tx) => {
      // 1. Create Address
      const address = await tx.address.create({
        data: {
          label: 'Salon Studio',
          streetLine1: dto.address.streetLine1,
          streetLine2: dto.address.streetLine2 || null,
          city: dto.address.city,
          state: dto.address.state,
          postalCode: dto.address.postalCode,
          country: dto.address.country || 'IN',
          latitude: dto.address.latitude ?? null,
          longitude: dto.address.longitude ?? null,
        },
      });

      // 2. Create Salon
      const newSalon = await tx.salon.create({
        data: {
          ownerId,
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
          phoneNumber: dto.phoneNumber.trim(),
          email: dto.email.toLowerCase().trim(),
          capacity: dto.capacity || 5,
          openingTime: dto.openingTime || '09:00',
          closingTime: dto.closingTime || '20:00',
          addressId: address.id,
          verificationStatus: 'PENDING',
        },
        include: {
          address: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // 3. Security Audit Record (D18, BR-16)
      await tx.auditLog.create({
        data: {
          userId: ownerId,
          eventType: 'SALON_REGISTRATION',
          targetEntity: 'Salon',
          targetId: newSalon.id,
          action: 'REGISTER_SALON',
          result: 'SUCCESS_PENDING_VERIFICATION',
        },
      });

      return newSalon;
    });

    return salon;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    city?: string;
    search?: string;
    status?: SalonVerificationStatus;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.verificationStatus = query.status;
    } else {
      // Default public directory shows verified & active salons
      where.verificationStatus = 'VERIFIED';
      where.isActive = true;
    }

    if (query.city && query.city !== 'ALL') {
      where.address = {
        city: { equals: query.city, mode: 'insensitive' },
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { address: { city: { contains: query.search, mode: 'insensitive' } } },
        { address: { streetLine2: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, salons] = await Promise.all([
      this.db.client.salon.count({ where }),
      this.db.client.salon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          address: true,
          _count: {
            select: {
              staff: true,
              bookings: true,
            },
          },
        },
      }),
    ]);

    return {
      items: salons,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const salon = await this.db.client.salon.findUnique({
      where: { id },
      include: {
        address: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        staff: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!salon) {
      throw new NotFoundException(`Salon with id ${id} not found`);
    }

    return salon;
  }

  async findBySlug(slug: string) {
    const salon = await this.db.client.salon.findUnique({
      where: { slug },
      include: {
        address: true,
        staff: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!salon) {
      throw new NotFoundException(`Salon with slug ${slug} not found`);
    }

    return salon;
  }

  async update(
    id: string,
    dto: UpdateSalonDto,
    userId: string,
    userRole: UserRole
  ) {
    const salon = await this.db.client.salon.findUnique({ where: { id } });
    if (!salon) {
      throw new NotFoundException(`Salon with id ${id} not found`);
    }

    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SUPER_ADMIN &&
      salon.ownerId !== userId
    ) {
      throw new ForbiddenException('You do not have permission to manage this salon');
    }

    const updated = await this.db.client.salon.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.phoneNumber && { phoneNumber: dto.phoneNumber.trim() }),
        ...(dto.email && { email: dto.email.toLowerCase().trim() }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.openingTime && { openingTime: dto.openingTime }),
        ...(dto.closingTime && { closingTime: dto.closingTime }),
      },
      include: {
        address: true,
      },
    });

    return updated;
  }

  async verify(id: string, dto: VerifySalonDto, adminId: string) {
    const salon = await this.db.client.salon.findUnique({ where: { id } });
    if (!salon) {
      throw new NotFoundException(`Salon with id ${id} not found`);
    }

    const updated = await this.db.client.salon.update({
      where: { id },
      data: { verificationStatus: dto.status },
      include: { address: true },
    });

    // Record Audit Log (D18, BR-13, BR-16)
    await this.db.client.auditLog.create({
      data: {
        userId: adminId,
        eventType: 'SALON_VERIFICATION',
        targetEntity: 'Salon',
        targetId: id,
        action: `VERIFY_${dto.status}`,
        result: dto.status,
        metadata: {
          previousStatus: salon.verificationStatus,
          newStatus: dto.status,
        },
      },
    });

    return updated;
  }

  async addStaff(
    salonId: string,
    dto: AddSalonStaffDto,
    requesterId: string,
    requesterRole: UserRole
  ) {
    const salon = await this.db.client.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException(`Salon with id ${salonId} not found`);
    }

    if (
      requesterRole !== UserRole.ADMIN &&
      requesterRole !== UserRole.SUPER_ADMIN &&
      salon.ownerId !== requesterId
    ) {
      throw new ForbiddenException('Only the salon owner or administrator can assign staff');
    }

    const user = await this.db.client.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${dto.userId} not found`);
    }

    const existing = await this.db.client.salonStaff.findUnique({
      where: { salonId_userId: { salonId, userId: dto.userId } },
    });

    if (existing) {
      throw new ConflictException('This staff member is already assigned to this salon');
    }

    const staff = await this.db.client.salonStaff.create({
      data: {
        salonId,
        userId: dto.userId,
        roleTitle: dto.roleTitle || 'Stylist',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return staff;
  }

  async getStaff(salonId: string) {
    return this.db.client.salonStaff.findMany({
      where: { salonId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }
}

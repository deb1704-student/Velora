import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { VerifyProviderDto } from './dto/verify-provider.dto';
import { ProviderVerificationStatus } from '@velora/types';

@Injectable()
export class ProvidersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    mode?: string;
    verificationStatus?: ProviderVerificationStatus;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.verificationStatus) {
      where.verificationStatus = query.verificationStatus;
    } else {
      // By default for public directory, show only APPROVED providers
      where.verificationStatus = 'APPROVED';
      where.isActive = true;
    }

    if (query.mode === 'HOME') {
      where.isHomeServiceAvailable = true;
    } else if (query.mode === 'SALON') {
      where.isSalonServiceAvailable = true;
    }

    if (query.search) {
      where.OR = [
        { bio: { contains: query.search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, providers] = await Promise.all([
      this.db.client.providerProfile.count({ where }),
      this.db.client.providerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ratingAverage: 'desc' },
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
          salon: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              assignedBookings: true,
              reviews: true,
            },
          },
        },
      }),
    ]);

    return {
      items: providers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const provider = await this.db.client.providerProfile.findUnique({
      where: { id },
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
        salon: true,
        schedules: {
          where: { isActive: true },
        },
        _count: {
          select: {
            assignedBookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`Specialist with id ${id} not found`);
    }

    return provider;
  }

  async updateMyProfile(userId: string, dto: UpdateProviderProfileDto) {
    const profile = await this.db.client.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Specialist profile not found for current user');
    }

    const updated = await this.db.client.providerProfile.update({
      where: { userId },
      data: {
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        ...(dto.serviceRadiusKm !== undefined && { serviceRadiusKm: dto.serviceRadiusKm }),
        ...(dto.isHomeServiceAvailable !== undefined && {
          isHomeServiceAvailable: dto.isHomeServiceAvailable,
        }),
        ...(dto.isSalonServiceAvailable !== undefined && {
          isSalonServiceAvailable: dto.isSalonServiceAvailable,
        }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async verifyProvider(id: string, dto: VerifyProviderDto, adminId: string) {
    const provider = await this.db.client.providerProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      throw new NotFoundException(`Specialist with id ${id} not found`);
    }

    const updated = await this.db.client.providerProfile.update({
      where: { id },
      data: {
        verificationStatus: dto.status,
        rejectionReason: dto.status === 'REJECTED' ? dto.reason || 'Requirements not met' : null,
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

    // Record Audit Log (D18, BR-13, BR-16)
    await this.db.client.auditLog.create({
      data: {
        userId: adminId,
        eventType: 'PROVIDER_VERIFICATION',
        targetEntity: 'ProviderProfile',
        targetId: id,
        action: `VERIFY_${dto.status}`,
        result: dto.status,
        metadata: {
          providerUserId: provider.userId,
          previousStatus: provider.verificationStatus,
          newStatus: dto.status,
          reason: dto.reason || null,
        },
      },
    });

    return updated;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async getProfile(userId: string) {
    const profile = await this.db.client.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
        memberships: {
          where: { isActive: true },
          include: { plan: true },
          take: 1,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto) {
    const profile = await this.db.client.customerProfile.update({
      where: { userId },
      data: {
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.preferredLanguage && { preferredLanguage: dto.preferredLanguage }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return profile;
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.user = {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { phoneNumber: { contains: query.search } },
        ],
      };
    }

    const [total, customers] = await Promise.all([
      this.db.client.customerProfile.count({ where }),
      this.db.client.customerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      }),
    ]);

    return {
      items: customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UserRole } from '@velora/types';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search } },
      ];
    }

    const [total, users] = await Promise.all([
      this.db.client.user.count({ where }),
      this.db.client.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      items: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.db.client.user.findUnique({
      where: { id },
      include: {
        customerProfile: true,
        providerProfile: true,
        addresses: true,
        ownedSalons: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.db.client.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName.trim() }),
        ...(dto.lastName && { lastName: dto.lastName.trim() }),
        ...(dto.phoneNumber && { phoneNumber: dto.phoneNumber.trim() }),
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, changedBy: string) {
    const user = await this.db.client.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updated = await this.db.client.user.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Record Status Change in Audit Log (D18, BR-16)
    await this.db.client.auditLog.create({
      data: {
        userId: changedBy,
        eventType: 'USER_STATUS_CHANGE',
        targetEntity: 'User',
        targetId: id,
        action: 'UPDATE_STATUS',
        result: `STATUS_SET_TO_${dto.status}`,
        metadata: {
          previousStatus: user.status,
          newStatus: dto.status,
          reason: dto.reason || null,
        },
      },
    });

    return updated;
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      // Unset previous default addresses for user
      await this.db.client.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.db.client.address.create({
      data: {
        userId,
        label: dto.label || 'Home',
        streetLine1: dto.streetLine1,
        streetLine2: dto.streetLine2 || null,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'IN',
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        isDefault: dto.isDefault || false,
      },
    });

    return address;
  }

  async getAddresses(userId: string) {
    return this.db.client.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.db.client.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found or does not belong to user');
    }

    await this.db.client.address.delete({
      where: { id: addressId },
    });

    return { success: true, message: 'Address removed successfully' };
  }
}

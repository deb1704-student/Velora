import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@velora/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    const existingEmail = await this.db.client.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists');
    }

    if (dto.phoneNumber) {
      const existingPhone = await this.db.client.user.findUnique({
        where: { phoneNumber: dto.phoneNumber.trim() },
      });
      if (existingPhone) {
        throw new ConflictException('This phone number is already linked to an account');
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.db.client.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          phoneNumber: dto.phoneNumber?.trim() || null,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          role: dto.role,
          status: 'ACTIVE',
        },
      });

      // Role-specific profile initialization (D2, D3)
      if (dto.role === UserRole.CUSTOMER) {
        await tx.customerProfile.create({
          data: {
            userId: createdUser.id,
            walletBalance: 0.0,
            loyaltyPoints: 0,
          },
        });
      } else if (dto.role === UserRole.PROVIDER) {
        await tx.providerProfile.create({
          data: {
            userId: createdUser.id,
            verificationStatus: 'UNVERIFIED',
            experienceYears: 0,
            serviceRadiusKm: 15,
            isHomeServiceAvailable: true,
            isSalonServiceAvailable: true,
          },
        });
      }

      // Security Audit Record (D18, BR-16)
      await tx.auditLog.create({
        data: {
          userId: createdUser.id,
          role: createdUser.role,
          eventType: 'USER_REGISTRATION',
          targetEntity: 'User',
          targetId: createdUser.id,
          action: 'REGISTER',
          result: 'SUCCESS',
          ipAddress: ipAddress || null,
        },
      });

      return createdUser;
    });

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.db.client.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        customerProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      // Record failed attempt in audit log
      await this.db.client.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          eventType: 'LOGIN_FAILURE',
          targetEntity: 'User',
          targetId: user.id,
          action: 'LOGIN',
          result: 'FAILED_INVALID_CREDENTIALS',
          ipAddress: ipAddress || null,
        },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Your account status is ${user.status}. Please contact platform support.`
      );
    }

    // Record successful login audit
    await this.db.client.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        eventType: 'USER_LOGIN',
        targetEntity: 'User',
        targetId: user.id,
        action: 'LOGIN',
        result: 'SUCCESS',
        ipAddress: ipAddress || null,
      },
    });

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret =
        this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
        'velora_dev_refresh_secret';

      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.db.client.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        providerProfile: true,
        ownedSalons: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'velora_dev_jwt_secret';
    const jwtExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') || '7d';

    const refreshSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
      'velora_dev_refresh_secret';
    const refreshExpiresIn =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '30d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: jwtExpiresIn,
    };
  }
}

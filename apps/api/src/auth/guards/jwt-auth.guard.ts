import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly db: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'velora_dev_jwt_secret';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Verify user still exists and is ACTIVE
      const user = await this.db.client.user.findUnique({
        where: { id: payload.sub },
        include: {
          customerProfile: true,
          providerProfile: true,
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Account inactive or not found');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...sanitizedUser } = user;
      request.user = sanitizedUser;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}

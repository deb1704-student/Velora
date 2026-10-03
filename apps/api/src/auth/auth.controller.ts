import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '@velora/types';
import { Request } from 'express';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new Customer, Provider, or Salon Owner account' })
  @ApiResponse({ status: 201, description: 'Account successfully registered and authenticated' })
  @ApiResponse({ status: 409, description: 'Email or phone number already in use' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const result = await this.authService.register(dto, ipAddress);
    return {
      success: true,
      message: 'Account registered successfully',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate credentials and obtain JWT token pair' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const result = await this.authService.login(dto, ipAddress);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and retrieve a fresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens renewed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const tokens = await this.authService.refreshToken(dto.refreshToken);
    return {
      success: true,
      message: 'Token renewed successfully',
      data: tokens,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve the authenticated user profile and roles' })
  @ApiResponse({ status: 200, description: 'Current profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('id') userId: string) {
    const user = await this.authService.getMe(userId);
    return {
      success: true,
      data: user,
    };
  }

  @Get('admin-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test endpoint verifying RBAC admin authorization' })
  @ApiResponse({ status: 200, description: 'Authorized as Administrator' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  async adminCheck(@CurrentUser() user: unknown) {
    return {
      success: true,
      message: 'RBAC verification successful: Admin authorization active',
      user,
    };
  }
}

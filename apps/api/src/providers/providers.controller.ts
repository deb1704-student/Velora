import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { VerifyProviderDto } from './dto/verify-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderVerificationStatus, UserRole } from '@velora/types';

@ApiTags('Provider & Specialist Domain')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Browse verified specialists with search, radius, and delivery filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'mode', required: false, enum: ['HOME', 'SALON'] })
  @ApiQuery({ name: 'verificationStatus', required: false, enum: ProviderVerificationStatus })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('mode') mode?: string,
    @Query('verificationStatus') verificationStatus?: ProviderVerificationStatus
  ) {
    const result = await this.providersService.findAll({
      page,
      limit,
      search,
      mode,
      verificationStatus,
    });
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve verified specialist profile details by ID' })
  async findById(@Param('id') id: string) {
    const provider = await this.providersService.findById(id);
    return { success: true, data: provider };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update logged-in specialist profile attributes (Specialist Only)' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProviderProfileDto
  ) {
    const updated = await this.providersService.updateMyProfile(userId, dto);
    return {
      success: true,
      message: 'Specialist profile updated successfully',
      data: updated,
    };
  }

  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or Reject specialist KYC accreditation (Admin Only)' })
  async verifyProvider(
    @Param('id') id: string,
    @Body() dto: VerifyProviderDto,
    @CurrentUser('id') adminId: string
  ) {
    const updated = await this.providersService.verifyProvider(id, dto, adminId);
    return {
      success: true,
      message: `Specialist verification status set to ${dto.status}`,
      data: updated,
    };
  }
}

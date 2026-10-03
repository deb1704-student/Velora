import {
  Controller,
  Get,
  Post,
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
import { SalonsService } from './salons.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { VerifySalonDto } from './dto/verify-salon.dto';
import { AddSalonStaffDto } from './dto/add-salon-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SalonVerificationStatus, UserRole } from '@velora/types';

@ApiTags('Salon Management Domain')
@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALON_OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new salon business studio (Salon Owner / Admin)' })
  async create(
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateSalonDto
  ) {
    const salon = await this.salonsService.create(ownerId, dto);
    return {
      success: true,
      message: 'Salon registered successfully (Pending Verification)',
      data: salon,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Browse accredited salon studios with city filter and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: SalonVerificationStatus })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('city') city?: string,
    @Query('search') search?: string,
    @Query('status') status?: SalonVerificationStatus
  ) {
    const result = await this.salonsService.findAll({
      page,
      limit,
      city,
      search,
      status,
    });
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve salon details by ID' })
  async findById(@Param('id') id: string) {
    const salon = await this.salonsService.findById(id);
    return { success: true, data: salon };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Retrieve salon details by URL slug' })
  async findBySlug(@Param('slug') slug: string) {
    const salon = await this.salonsService.findBySlug(slug);
    return { success: true, data: salon };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALON_OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update salon studio details (Owner / Admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSalonDto,
    @CurrentUser() user: { id: string; role: UserRole }
  ) {
    const updated = await this.salonsService.update(id, dto, user.id, user.role);
    return {
      success: true,
      message: 'Salon details updated successfully',
      data: updated,
    };
  }

  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify or Reject salon accreditation (Admin Only)' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifySalonDto,
    @CurrentUser('id') adminId: string
  ) {
    const updated = await this.salonsService.verify(id, dto, adminId);
    return {
      success: true,
      message: `Salon accreditation set to ${dto.status}`,
      data: updated,
    };
  }

  @Post(':id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALON_OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a staff member to the salon (Owner / Admin)' })
  async addStaff(
    @Param('id') salonId: string,
    @Body() dto: AddSalonStaffDto,
    @CurrentUser() user: { id: string; role: UserRole }
  ) {
    const staff = await this.salonsService.addStaff(
      salonId,
      dto,
      user.id,
      user.role
    );
    return {
      success: true,
      message: 'Staff member assigned successfully',
      data: staff,
    };
  }

  @Get(':id/staff')
  @ApiOperation({ summary: 'List active staff stylists assigned to salon' })
  async getStaff(@Param('id') salonId: string) {
    const staff = await this.salonsService.getStaff(salonId);
    return { success: true, data: staff };
  }
}

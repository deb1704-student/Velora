import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { AvailabilityService } from './availability.service';
import { SetWeeklyScheduleDto } from './dto/set-schedule.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@velora/types';

@ApiTags('Availability & Scheduling')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ==========================================
  // 1. SLOT GENERATION (PUBLIC SEARCH ENGINE)
  // ==========================================

  @Get('slots')
  @ApiOperation({
    summary: 'Search available appointment slots for a service, date, and venue (Public)',
  })
  async getAvailableSlots(@Query() query: QuerySlotsDto) {
    const result = await this.availabilityService.findAvailableSlots(query);
    return {
      success: true,
      data: result,
    };
  }

  // ==========================================
  // 2. PROVIDER SCHEDULES
  // ==========================================

  @Get('schedules/:providerId')
  @ApiOperation({ summary: 'Get working schedule and upcoming leaves for a specialist' })
  async getSchedule(@Param('providerId') providerId: string) {
    const data = await this.availabilityService.getProviderSchedule(providerId);
    return {
      success: true,
      data,
    };
  }

  @Put('schedules/:providerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set or update weekly recurring working hours (Specialist / Admin)' })
  async setSchedule(
    @Param('providerId') providerId: string,
    @Body() dto: SetWeeklyScheduleDto,
    @CurrentUser() user: { id: string; role: UserRole }
  ) {
    const data = await this.availabilityService.setWeeklySchedule(providerId, dto, user);
    return {
      success: true,
      message: 'Weekly working hours updated successfully',
      data,
    };
  }

  // ==========================================
  // 3. TIME OFF / LEAVES
  // ==========================================

  @Post('time-off/:providerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register vacation, personal leave or blocked time (Specialist / Admin)' })
  async createTimeOff(
    @Param('providerId') providerId: string,
    @Body() dto: CreateTimeOffDto,
    @CurrentUser() user: { id: string; role: UserRole }
  ) {
    const data = await this.availabilityService.createTimeOff(providerId, dto, user);
    return {
      success: true,
      message: 'Time-off registered and slots blocked',
      data,
    };
  }

  @Get('time-off/:providerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View recorded leaves and blocked intervals for a specialist' })
  async getTimeOff(@Param('providerId') providerId: string) {
    const data = await this.availabilityService.getProviderTimeOff(providerId);
    return {
      success: true,
      data,
    };
  }

  @Delete('time-off/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel leave / unblock time slot' })
  async deleteTimeOff(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole }
  ) {
    return this.availabilityService.deleteTimeOff(id, user);
  }

  // ==========================================
  // 4. SALON CAPACITY & WORKSTATION UTILIZATION
  // ==========================================

  @Get('salon-capacity/:salonId')
  @ApiOperation({ summary: 'Audit salon workstation chair utilization by hour (Public / Salon)' })
  @ApiQuery({ name: 'date', required: true, example: '2026-10-10' })
  async getSalonUtilization(
    @Param('salonId') salonId: string,
    @Query('date') date: string
  ) {
    const data = await this.availabilityService.getSalonUtilization(salonId, date);
    return {
      success: true,
      data,
    };
  }
}

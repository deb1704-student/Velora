import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BookingStatus, UserRole } from '@velora/types';

@ApiTags('Bookings & Appointment Lifecycle (D7)')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new appointment booking with transactional slot verification' })
  async createBooking(@Body() dto: CreateBookingDto, @Request() req: any) {
    const booking = await this.bookingsService.createBooking(dto, req.user);
    return {
      success: true,
      message: 'Appointment booking successfully created and verified',
      data: booking,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List bookings with role-based scoping and filters' })
  async listBookings(@Query() query: QueryBookingsDto, @Request() req: any) {
    return this.bookingsService.listBookings(query, req.user);
  }

  @Get('my')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get current customer appointment history' })
  async getMyBookings(@Query() query: QueryBookingsDto, @Request() req: any) {
    return this.bookingsService.listBookings(
      { ...query, customerId: undefined },
      { ...req.user, role: UserRole.CUSTOMER }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details with status audit trail' })
  async getBookingById(@Param('id') id: string, @Request() req: any) {
    const booking = await this.bookingsService.getBookingById(id, req.user);
    return {
      success: true,
      data: booking,
    };
  }

  @Patch(':id/transition')
  @ApiOperation({ summary: 'Execute validated state machine transition' })
  async transitionStatus(
    @Param('id') id: string,
    @Body() dto: TransitionStatusDto,
    @Request() req: any
  ) {
    const updated = await this.bookingsService.transitionStatus(id, dto, req.user);
    return {
      success: true,
      message: `Booking successfully transitioned to ${dto.status}`,
      data: updated,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking prior to service commencement' })
  async cancelBooking(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @Request() req: any
  ) {
    const updated = await this.bookingsService.cancelBooking(id, dto, req.user);
    return {
      success: true,
      message: 'Booking cancelled successfully',
      data: updated,
    };
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule appointment with slot revalidation' })
  async rescheduleBooking(
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
    @Request() req: any
  ) {
    const updated = await this.bookingsService.rescheduleBooking(id, dto, req.user);
    return {
      success: true,
      message: 'Appointment successfully rescheduled',
      data: updated,
    };
  }

  @Post(':id/no-show')
  @Roles(
    UserRole.PROVIDER,
    UserRole.SALON_OWNER,
    UserRole.SALON_MANAGER,
    UserRole.SALON_STAFF,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  )
  @ApiOperation({ summary: 'Mark customer appointment as no-show' })
  async markNoShow(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @Request() req: any
  ) {
    const updated = await this.bookingsService.transitionStatus(
      id,
      {
        status: BookingStatus.NO_SHOW,
        reason: 'Customer did not arrive for scheduled appointment',
        notes: body.notes || 'No-show marked by atelier staff / specialist',
      },
      req.user
    );
    return {
      success: true,
      message: 'Appointment marked as NO_SHOW',
      data: updated,
    };
  }
}

import {
  Controller,
  Get,
  Patch,
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
import { CustomersService } from './customers.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@velora/types';

@ApiTags('Customer Domain')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve logged-in customer profile, wallet balance, and loyalty points' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    const profile = await this.customersService.getProfile(userId);
    return { success: true, data: profile };
  }

  @Patch('me')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Update customer personal preferences and details' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCustomerProfileDto
  ) {
    const updated = await this.customersService.updateProfile(userId, dto);
    return {
      success: true,
      message: 'Profile preferences updated successfully',
      data: updated,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List customer profiles with search and pagination (Admin Only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    const result = await this.customersService.findAll({ page, limit, search });
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }
}

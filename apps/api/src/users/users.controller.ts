import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@velora/types';

@ApiTags('User & Account Management')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all users with pagination, role filter, and keyword search (Admin Only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: UserRole,
    @Query('search') search?: string
  ) {
    const result = await this.usersService.findAll({ page, limit, role, search });
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user account details by ID (Self or Admin)' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('You do not have permission to view this account');
    }

    const user = await this.usersService.findById(id);
    return { success: true, data: user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user personal details (Self or Admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('You do not have permission to update this account');
    }

    const updated = await this.usersService.update(id, dto);
    return {
      success: true,
      message: 'Account details updated successfully',
      data: updated,
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user account status (Activate, Suspend, Deactivate) (Admin Only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('id') adminId: string
  ) {
    const updated = await this.usersService.updateStatus(id, dto, adminId);
    return {
      success: true,
      message: `User status changed to ${dto.status}`,
      data: updated,
    };
  }

  @Post(':id/addresses')
  @ApiOperation({ summary: 'Add a new service address for user (Self or Admin)' })
  async addAddress(
    @Param('id') id: string,
    @Body() dto: CreateAddressDto,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('Cannot modify addresses for other accounts');
    }

    const address = await this.usersService.addAddress(id, dto);
    return {
      success: true,
      message: 'Address added successfully',
      data: address,
    };
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'List saved service addresses for user (Self or Admin)' })
  async getAddresses(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('Cannot view addresses for other accounts');
    }

    const addresses = await this.usersService.getAddresses(id);
    return { success: true, data: addresses };
  }

  @Delete(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Delete a saved service address (Self or Admin)' })
  async deleteAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('Cannot delete addresses for other accounts');
    }

    const result = await this.usersService.deleteAddress(id, addressId);
    return result;
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateAddonDto } from './dto/create-addon.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { AssignSalonServiceDto } from './dto/assign-salon-service.dto';
import { AssignProviderServiceDto } from './dto/assign-provider-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ServiceDeliveryType, UserRole } from '@velora/types';

@ApiTags('Service Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ==========================================
  // 1. CATEGORIES
  // ==========================================

  @Get('categories')
  @ApiOperation({ summary: 'List all service categories with nested subcategories (Public)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async getCategories(@Query('includeInactive') includeInactive?: boolean) {
    const data = await this.catalogService.findAllCategories(includeInactive);
    return {
      success: true,
      data,
    };
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category detail with child subcategories and services (Public)' })
  async getCategoryById(@Param('id') id: string) {
    const data = await this.catalogService.findCategoryById(id);
    return {
      success: true,
      data,
    };
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new catalog category (Admin Only)' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const data = await this.catalogService.createCategory(dto);
    return {
      success: true,
      message: 'Category created successfully',
      data,
    };
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update catalog category (Admin Only)' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.catalogService.updateCategory(id, dto);
    return {
      success: true,
      message: 'Category updated successfully',
      data,
    };
  }

  // ==========================================
  // 2. SERVICES
  // ==========================================

  @Get('services')
  @ApiOperation({ summary: 'List and filter services with pagination (Public)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'deliveryType', enum: ServiceDeliveryType, required: false })
  @ApiQuery({ name: 'salonId', required: false })
  @ApiQuery({ name: 'providerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getServices(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('deliveryType') deliveryType?: ServiceDeliveryType,
    @Query('salonId') salonId?: string,
    @Query('providerId') providerId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.catalogService.findAllServices({
      categoryId,
      search,
      deliveryType,
      salonId,
      providerId,
      page,
      limit,
    });
    return {
      success: true,
      ...result,
    };
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service details by ID (Public)' })
  async getServiceById(@Param('id') id: string) {
    const data = await this.catalogService.findServiceById(id);
    return {
      success: true,
      data,
    };
  }

  @Get('services/slug/:slug')
  @ApiOperation({ summary: 'Get service details by SEO slug (Public)' })
  async getServiceBySlug(@Param('slug') slug: string) {
    const data = await this.catalogService.findServiceBySlug(slug);
    return {
      success: true,
      data,
    };
  }

  @Post('services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service to platform catalog (Admin Only)' })
  async createService(@Body() dto: CreateServiceDto) {
    const data = await this.catalogService.createService(dto);
    return {
      success: true,
      message: 'Service created successfully',
      data,
    };
  }

  @Patch('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update catalog service (Admin Only)' })
  async updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const data = await this.catalogService.updateService(id, dto);
    return {
      success: true,
      message: 'Service updated successfully',
      data,
    };
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate or delete service (Admin Only)' })
  async deleteService(@Param('id') id: string) {
    await this.catalogService.deleteService(id);
    return {
      success: true,
      message: 'Service removed from catalog',
    };
  }

  // ==========================================
  // 3. SERVICE ADD-ONS
  // ==========================================

  @Post('services/:serviceId/addons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attach add-on booster to a service (Admin Only)' })
  async createAddon(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateAddonDto
  ) {
    const data = await this.catalogService.createAddon(serviceId, dto);
    return {
      success: true,
      message: 'Add-on created successfully',
      data,
    };
  }

  @Get('services/:serviceId/addons')
  @ApiOperation({ summary: 'List active add-ons for a specific service (Public)' })
  async getServiceAddons(@Param('serviceId') serviceId: string) {
    const data = await this.catalogService.findAddonsByService(serviceId);
    return {
      success: true,
      data,
    };
  }

  // ==========================================
  // 4. SERVICE PACKAGES / BUNDLES
  // ==========================================

  @Get('packages')
  @ApiOperation({ summary: 'List all bundled service packages (Public)' })
  async getPackages() {
    const data = await this.catalogService.findAllPackages();
    return {
      success: true,
      data,
    };
  }

  @Get('packages/slug/:slug')
  @ApiOperation({ summary: 'Get bundled package detail by slug (Public)' })
  async getPackageBySlug(@Param('slug') slug: string) {
    const data = await this.catalogService.findPackageBySlug(slug);
    return {
      success: true,
      data,
    };
  }

  @Post('packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create bundled multi-service package (Admin Only)' })
  async createPackage(@Body() dto: CreatePackageDto) {
    const data = await this.catalogService.createPackage(dto);
    return {
      success: true,
      message: 'Package created successfully',
      data,
    };
  }

  // ==========================================
  // 5. SALON & PROVIDER OVERRIDES
  // ==========================================

  @Post('salons/:salonId/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALON_OWNER, UserRole.SALON_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign service to salon with optional custom price (Salon Partner)' })
  async assignSalonService(
    @Param('salonId') salonId: string,
    @Body() dto: AssignSalonServiceDto
  ) {
    const data = await this.catalogService.assignServiceToSalon(salonId, dto);
    return {
      success: true,
      message: 'Service assigned to salon studio catalog',
      data,
    };
  }

  @Get('salons/:salonId/services')
  @ApiOperation({ summary: 'List services offered at a specific salon (Public)' })
  async getSalonServices(@Param('salonId') salonId: string) {
    const data = await this.catalogService.findSalonServices(salonId);
    return {
      success: true,
      data,
    };
  }

  @Post('providers/:providerId/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign certified service qualification to provider (Specialist)' })
  async assignProviderService(
    @Param('providerId') providerId: string,
    @Body() dto: AssignProviderServiceDto
  ) {
    const data = await this.catalogService.assignServiceToProvider(providerId, dto);
    return {
      success: true,
      message: 'Service qualification added to specialist profile',
      data,
    };
  }

  @Get('providers/:providerId/services')
  @ApiOperation({ summary: 'List qualified services for a specialist (Public)' })
  async getProviderServices(@Param('providerId') providerId: string) {
    const data = await this.catalogService.findProviderServices(providerId);
    return {
      success: true,
      data,
    };
  }
}

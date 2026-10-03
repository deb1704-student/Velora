import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateAddonDto } from './dto/create-addon.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { AssignSalonServiceDto } from './dto/assign-salon-service.dto';
import { AssignProviderServiceDto } from './dto/assign-provider-service.dto';
import { ServiceDeliveryType } from '@velora/types';

@Injectable()
export class CatalogService {
  constructor(private readonly db: DatabaseService) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ==========================================
  // 1. CATEGORIES & HIERARCHY
  // ==========================================

  async createCategory(dto: CreateCategoryDto) {
    let slug = this.generateSlug(dto.name);
    const existing = await this.db.client.serviceCategory.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    if (dto.parentId) {
      const parent = await this.db.client.serviceCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category ${dto.parentId} not found`);
      }
    }

    return this.db.client.serviceCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findAllCategories(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.db.client.serviceCategory.findMany({
      where: {
        ...where,
        parentId: null, // Return top-level root categories with nested children
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where,
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { services: true } },
          },
        },
        _count: { select: { services: true } },
      },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.db.client.serviceCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.db.client.serviceCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    let slug = category.slug;
    if (dto.name && dto.name !== category.name) {
      slug = this.generateSlug(dto.name);
      const conflict = await this.db.client.serviceCategory.findFirst({
        where: { slug, id: { not: id } },
      });
      if (conflict) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    return this.db.client.serviceCategory.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name, slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // ==========================================
  // 2. SERVICES
  // ==========================================

  async createService(dto: CreateServiceDto) {
    const category = await this.db.client.serviceCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    let slug = this.generateSlug(dto.name);
    const existing = await this.db.client.serviceItem.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    return this.db.client.serviceItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        basePrice: dto.basePrice,
        currency: dto.currency || 'INR',
        deliveryType: dto.deliveryType || ServiceDeliveryType.BOTH,
        requirements: dto.requirements,
        imageUrl: dto.imageUrl,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findAllServices(query: {
    categoryId?: string;
    search?: string;
    deliveryType?: ServiceDeliveryType;
    salonId?: string;
    providerId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.categoryId) {
      // Find category and its children to match services in parent category
      const subcategories = await this.db.client.serviceCategory.findMany({
        where: { parentId: query.categoryId },
        select: { id: true },
      });
      const categoryIds = [query.categoryId, ...subcategories.map((c) => c.id)];
      where.categoryId = { in: categoryIds };
    }

    if (query.deliveryType) {
      if (query.deliveryType === ServiceDeliveryType.HOME) {
        where.deliveryType = { in: [ServiceDeliveryType.HOME, ServiceDeliveryType.BOTH] };
      } else if (query.deliveryType === ServiceDeliveryType.SALON) {
        where.deliveryType = { in: [ServiceDeliveryType.SALON, ServiceDeliveryType.BOTH] };
      }
    }

    if (query.salonId) {
      where.salonServices = {
        some: { salonId: query.salonId, isActive: true },
      };
    }

    if (query.providerId) {
      where.providerServices = {
        some: { providerId: query.providerId, isCertified: true },
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, services] = await Promise.all([
      this.db.client.serviceItem.count({ where }),
      this.db.client.serviceItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          addons: { where: { isActive: true } },
        },
      }),
    ]);

    return {
      data: services,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findServiceById(id: string) {
    const service = await this.db.client.serviceItem.findUnique({
      where: { id },
      include: {
        category: true,
        addons: { where: { isActive: true } },
        salonServices: {
          where: { isActive: true },
          include: { salon: { select: { id: true, name: true, slug: true } } },
        },
        packageItems: {
          include: {
            package: { select: { id: true, name: true, price: true, slug: true } },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async findServiceBySlug(slug: string) {
    const service = await this.db.client.serviceItem.findUnique({
      where: { slug },
      include: {
        category: true,
        addons: { where: { isActive: true } },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with slug ${slug} not found`);
    }

    return service;
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    const service = await this.db.client.serviceItem.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    let slug = service.slug;
    if (dto.name && dto.name !== service.name) {
      slug = this.generateSlug(dto.name);
      const conflict = await this.db.client.serviceItem.findFirst({
        where: { slug, id: { not: id } },
      });
      if (conflict) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    return this.db.client.serviceItem.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name, slug }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.description && { description: dto.description }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
        ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.deliveryType && { deliveryType: dto.deliveryType }),
        ...(dto.requirements !== undefined && { requirements: dto.requirements }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        addons: true,
      },
    });
  }

  async deleteService(id: string) {
    const service = await this.db.client.serviceItem.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Check if bookings exist
    const bookingsCount = await this.db.client.booking.count({ where: { serviceId: id } });
    if (bookingsCount > 0) {
      // Soft-deactivate if historical bookings depend on it
      return this.db.client.serviceItem.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.db.client.serviceItem.delete({ where: { id } });
  }

  // ==========================================
  // 3. SERVICE ADD-ONS
  // ==========================================

  async createAddon(serviceId: string, dto: CreateAddonDto) {
    const service = await this.db.client.serviceItem.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    return this.db.client.serviceAddon.create({
      data: {
        serviceId,
        name: dto.name,
        description: dto.description,
        extraDurationMinutes: dto.extraDurationMinutes ?? 15,
        price: dto.price,
        isActive: true,
      },
    });
  }

  async findAddonsByService(serviceId: string) {
    return this.db.client.serviceAddon.findMany({
      where: { serviceId, isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async updateAddon(addonId: string, dto: Partial<CreateAddonDto> & { isActive?: boolean }) {
    const addon = await this.db.client.serviceAddon.findUnique({ where: { id: addonId } });
    if (!addon) {
      throw new NotFoundException(`Addon with ID ${addonId} not found`);
    }

    return this.db.client.serviceAddon.update({
      where: { id: addonId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.extraDurationMinutes !== undefined && {
          extraDurationMinutes: dto.extraDurationMinutes,
        }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // ==========================================
  // 4. SERVICE PACKAGES / BUNDLES
  // ==========================================

  async createPackage(dto: CreatePackageDto) {
    let slug = this.generateSlug(dto.name);
    const existing = await this.db.client.servicePackage.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Verify all serviceIds exist
    const services = await this.db.client.serviceItem.findMany({
      where: { id: { in: dto.serviceIds } },
    });
    if (services.length !== dto.serviceIds.length) {
      throw new BadRequestException('One or more specified service IDs do not exist');
    }

    return this.db.client.servicePackage.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'INR',
        discountPercentage: dto.discountPercentage,
        durationMinutes: dto.durationMinutes,
        imageUrl: dto.imageUrl,
        isActive: true,
        items: {
          create: dto.serviceIds.map((serviceId, index) => ({
            serviceId,
            sortOrder: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            service: { select: { id: true, name: true, durationMinutes: true, basePrice: true } },
          },
        },
      },
    });
  }

  async findAllPackages() {
    return this.db.client.servicePackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
                basePrice: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  async findPackageBySlug(slug: string) {
    const pkg = await this.db.client.servicePackage.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            service: {
              include: {
                category: true,
                addons: { where: { isActive: true } },
              },
            },
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with slug ${slug} not found`);
    }

    return pkg;
  }

  // ==========================================
  // 5. SALON & PROVIDER OVERRIDES
  // ==========================================

  async assignServiceToSalon(salonId: string, dto: AssignSalonServiceDto) {
    const salon = await this.db.client.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException(`Salon with ID ${salonId} not found`);
    }

    const service = await this.db.client.serviceItem.findUnique({ where: { id: dto.serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }

    return this.db.client.salonService.upsert({
      where: {
        salonId_serviceId: {
          salonId,
          serviceId: dto.serviceId,
        },
      },
      update: {
        customPrice: dto.customPrice,
        customDuration: dto.customDuration,
        isActive: true,
      },
      create: {
        salonId,
        serviceId: dto.serviceId,
        customPrice: dto.customPrice,
        customDuration: dto.customDuration,
        isActive: true,
      },
      include: {
        service: true,
      },
    });
  }

  async findSalonServices(salonId: string) {
    return this.db.client.salonService.findMany({
      where: { salonId, isActive: true },
      include: {
        service: {
          include: {
            category: true,
            addons: { where: { isActive: true } },
          },
        },
      },
    });
  }

  async assignServiceToProvider(providerId: string, dto: AssignProviderServiceDto) {
    const provider = await this.db.client.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      throw new NotFoundException(`Provider profile ${providerId} not found`);
    }

    const service = await this.db.client.serviceItem.findUnique({ where: { id: dto.serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }

    return this.db.client.providerService.upsert({
      where: {
        providerId_serviceId: {
          providerId,
          serviceId: dto.serviceId,
        },
      },
      update: {
        isCertified: dto.isCertified ?? true,
      },
      create: {
        providerId,
        serviceId: dto.serviceId,
        isCertified: dto.isCertified ?? true,
      },
      include: {
        service: true,
      },
    });
  }

  async findProviderServices(providerId: string) {
    return this.db.client.providerService.findMany({
      where: { providerId, isCertified: true },
      include: {
        service: {
          include: {
            category: true,
            addons: { where: { isActive: true } },
          },
        },
      },
    });
  }
}

import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, ServiceDeliveryType } from '@velora/types';

export class QueryBookingsDto {
  @ApiPropertyOptional({ enum: BookingStatus, description: 'Filter by lifecycle state' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ enum: ServiceDeliveryType, description: 'Filter by delivery venue' })
  @IsOptional()
  @IsEnum(ServiceDeliveryType)
  deliveryType?: ServiceDeliveryType;

  @ApiPropertyOptional({ example: '2026-10-01', description: 'Start date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'End date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'uuid-salon-id', description: 'Salon atelier filter' })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({ example: 'uuid-provider-id', description: 'Specialist filter' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ example: 'uuid-customer-id', description: 'Customer profile filter' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'VEL-2026', description: 'Search by reference or customer name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}

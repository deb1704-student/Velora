import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceDeliveryType } from '@velora/types';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'uuid-category-id' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Signature Balayage, Toner & Silk Blowout' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated comprehensive description of the service.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 135 })
  @IsOptional()
  @IsInt()
  @Min(5)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 3800.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: ServiceDeliveryType })
  @IsOptional()
  @IsEnum(ServiceDeliveryType)
  deliveryType?: ServiceDeliveryType;

  @ApiPropertyOptional({ example: 'Patch test recommended 24 hours prior.' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1560869713-7d0a29430803' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

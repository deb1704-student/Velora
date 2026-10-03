import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceDeliveryType } from '@velora/types';

export class CreateServiceDto {
  @ApiProperty({ example: 'uuid-category-id', description: 'Category identifier' })
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId!: string;

  @ApiProperty({ example: 'Signature Balayage & Gloss' })
  @IsString()
  @IsNotEmpty({ message: 'Service name is required' })
  name!: string;

  @ApiProperty({
    example:
      'Hand-painted dimensional highlighting tailored to hair texture with bespoke toner and gloss treatment.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Service description is required' })
  description!: string;

  @ApiProperty({ example: 120, description: 'Duration in minutes', minimum: 5 })
  @IsInt()
  @Min(5)
  durationMinutes!: number;

  @ApiProperty({ example: 3500.0, description: 'Base price in standard currency units' })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiPropertyOptional({
    enum: ServiceDeliveryType,
    default: ServiceDeliveryType.BOTH,
    description: 'Service delivery venue',
  })
  @IsOptional()
  @IsEnum(ServiceDeliveryType)
  deliveryType?: ServiceDeliveryType = ServiceDeliveryType.BOTH;

  @ApiPropertyOptional({
    example: 'Client must have clean dry hair free of heavy oils or waxes.',
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1560869713-7d0a29430803' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

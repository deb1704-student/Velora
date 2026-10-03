import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceDeliveryType } from '@velora/types';

export class QuerySlotsDto {
  @ApiProperty({ example: 'uuid-service-id', description: 'Target ServiceItem ID' })
  @IsString()
  @IsNotEmpty({ message: 'serviceId is required' })
  serviceId!: string;

  @ApiProperty({ example: '2026-10-10', description: 'Target appointment date (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'date must be in YYYY-MM-DD format' })
  date!: string;

  @ApiProperty({
    enum: ServiceDeliveryType,
    example: ServiceDeliveryType.SALON,
    description: 'Service delivery venue (SALON or HOME)',
  })
  @IsEnum(ServiceDeliveryType, { message: 'deliveryType must be SALON or HOME' })
  deliveryType!: ServiceDeliveryType;

  @ApiPropertyOptional({ example: 'uuid-salon-id', description: 'Specific salon ID filter' })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({ example: 'uuid-provider-id', description: 'Specific provider profile ID filter' })
  @IsOptional()
  @IsString()
  providerId?: string;
}

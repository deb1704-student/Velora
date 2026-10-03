import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceDeliveryType } from '@velora/types';

export class CreateBookingDto {
  @ApiPropertyOptional({ example: 'uuid-service-id', description: 'Single service to book' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ example: 'uuid-package-id', description: 'Curated ritual suite package to book' })
  @IsOptional()
  @IsString()
  packageId?: string;

  @ApiProperty({
    enum: ServiceDeliveryType,
    example: ServiceDeliveryType.SALON,
    description: 'Delivery channel (SALON or HOME)',
  })
  @IsEnum(ServiceDeliveryType, { message: 'deliveryType must be SALON or HOME' })
  deliveryType!: ServiceDeliveryType;

  @ApiProperty({ example: '2026-10-10', description: 'Appointment date (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'appointmentDate must be in YYYY-MM-DD format' })
  appointmentDate!: string;

  @ApiProperty({ example: '09:30', description: 'Appointment start time in 24-hr format (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'startTime is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime!: string;

  @ApiPropertyOptional({ example: 'uuid-salon-id', description: 'Salon atelier ID if in-salon' })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({ example: 'uuid-provider-id', description: 'Specific specialist profile ID' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ example: 'uuid-address-id', description: 'Customer address ID for at-home service' })
  @ValidateIf((o) => o.deliveryType === ServiceDeliveryType.HOME)
  @IsNotEmpty({ message: 'addressId is required for at-home services' })
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ example: ['uuid-addon-1', 'uuid-addon-2'], description: 'Optional add-on booster IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonIds?: string[];

  @ApiPropertyOptional({ example: 'Please use unscented botanical shampoo if possible.', description: 'Client notes' })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}

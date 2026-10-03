import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@velora/types';

export class TransitionStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.PROVIDER_ARRIVED,
    description: 'Target lifecycle state in the canonical state machine',
  })
  @IsEnum(BookingStatus, { message: 'Invalid target BookingStatus' })
  @IsNotEmpty({ message: 'status is required' })
  status!: BookingStatus;

  @ApiPropertyOptional({ example: 'Client arrived at the styling chair.', description: 'Operational reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Consultation conducted before treatment.', description: 'Auditing notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: { stationNumber: 4, arrivedTime: '09:28' },
    description: 'Supplemental structured metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

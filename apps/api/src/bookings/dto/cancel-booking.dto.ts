import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ example: 'Client had a sudden schedule conflict.', description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  reason!: string;

  @ApiPropertyOptional({ example: 'Customer requested cancellation more than 24 hours prior.', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

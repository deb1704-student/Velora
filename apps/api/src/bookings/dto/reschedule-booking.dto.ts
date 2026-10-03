import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RescheduleBookingDto {
  @ApiProperty({ example: '2026-10-17', description: 'New target appointment date (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'appointmentDate must be in YYYY-MM-DD format' })
  @IsNotEmpty({ message: 'appointmentDate is required' })
  appointmentDate!: string;

  @ApiProperty({ example: '14:00', description: 'New target start time (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'startTime is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime!: string;

  @ApiPropertyOptional({ example: 'Client requested reschedule due to flight delay.', description: 'Reason for rescheduling' })
  @IsOptional()
  @IsString()
  reason?: string;
}

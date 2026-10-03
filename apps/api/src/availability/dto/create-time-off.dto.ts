import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeOffDto {
  @ApiProperty({ example: '2026-10-15', description: 'Start date of leave/time-off (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'startDate must be a valid ISO date string (YYYY-MM-DD)' })
  startDate!: string;

  @ApiProperty({ example: '2026-10-16', description: 'End date of leave/time-off (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'endDate must be a valid ISO date string (YYYY-MM-DD)' })
  endDate!: string;

  @ApiPropertyOptional({ example: '10:00', description: 'Optional partial day start time in HH:mm' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiPropertyOptional({ example: '15:00', description: 'Optional partial day end time in HH:mm' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @ApiPropertyOptional({ example: 'Attending European Trichology Conference in Paris' })
  @IsOptional()
  @IsString()
  reason?: string;
}

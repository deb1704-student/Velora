import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '@velora/types';

export class DayScheduleDto {
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek, { message: 'dayOfWeek must be a valid DayOfWeek' })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: '09:00', description: 'Shift start time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm 24-hour format' })
  startTime!: string;

  @ApiProperty({ example: '18:00', description: 'Shift end time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm 24-hour format' })
  endTime!: string;

  @ApiPropertyOptional({ example: '13:00', description: 'Break start time in HH:mm format' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'breakStartTime must be in HH:mm format' })
  breakStartTime?: string;

  @ApiPropertyOptional({ example: '14:00', description: 'Break end time in HH:mm format' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'breakEndTime must be in HH:mm format' })
  breakEndTime?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class SetWeeklyScheduleDto {
  @ApiProperty({ type: [DayScheduleDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one day schedule must be provided' })
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedules!: DayScheduleDto[];
}

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@velora/types';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiPropertyOptional({ example: 'Verified identity documentation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddSalonStaffDto {
  @ApiProperty({ example: 'user-uuid-1234', description: 'User ID of the staff member' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({ example: 'Senior Stylist', default: 'Stylist' })
  @IsOptional()
  @IsString()
  roleTitle?: string = 'Stylist';
}

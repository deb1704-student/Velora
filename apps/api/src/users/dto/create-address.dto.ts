import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'Flat 402, Prestige Palms' })
  @IsString()
  @IsNotEmpty()
  streetLine1!: string;

  @ApiPropertyOptional({ example: '100 Feet Road, Indiranagar' })
  @IsOptional()
  @IsString()
  streetLine2?: string;

  @ApiProperty({ example: 'Bengaluru' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '560038' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @ApiPropertyOptional({ example: 'IN', default: 'IN' })
  @IsOptional()
  @IsString()
  country?: string = 'IN';

  @ApiPropertyOptional({ example: 12.9716 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 77.5946 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}

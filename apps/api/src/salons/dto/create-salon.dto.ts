import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from '../../users/dto/create-address.dto';

export class CreateSalonDto {
  @ApiProperty({ example: 'Aura Studio & Lounge' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Modern boutique salon specializing in hair styling and advanced spa therapies.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '+919845012345' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ example: 'contact@aurastudio.in' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 6, minimum: 1, default: 5 })
  @IsInt()
  @Min(1)
  capacity: number = 5;

  @ApiProperty({ example: '09:00', default: '09:00' })
  @IsString()
  openingTime: string = '09:00';

  @ApiProperty({ example: '20:30', default: '20:00' })
  @IsString()
  closingTime: string = '20:00';

  @ApiProperty({ type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;
}

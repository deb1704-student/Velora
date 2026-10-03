import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddonDto {
  @ApiProperty({ example: 'Argan Oil Deep Condition Infusion' })
  @IsString()
  @IsNotEmpty({ message: 'Addon name is required' })
  name!: string;

  @ApiPropertyOptional({ example: 'Restorative organic Moroccan argan oil hydration mask under steam.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 15, default: 15, description: 'Additional time required in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  extraDurationMinutes?: number = 15;

  @ApiProperty({ example: 650.0, description: 'Price in standard currency units' })
  @IsNumber()
  @Min(0)
  price!: number;
}

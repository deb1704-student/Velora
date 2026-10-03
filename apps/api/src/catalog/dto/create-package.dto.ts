import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Bridal Radiance Glow Suite' })
  @IsString()
  @IsNotEmpty({ message: 'Package name is required' })
  name!: string;

  @ApiProperty({
    example:
      'Curated bridal package including Couture Hair Styling, High-Definition Airbrush Makeup, and Spa Manicure/Pedicure.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Package description is required' })
  description!: string;

  @ApiProperty({ example: 12500.0, description: 'Package price in standard currency units' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiPropertyOptional({ example: 20.0, description: 'Discount percentage vs standalone services' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @ApiProperty({ example: 240, description: 'Estimated combined duration in minutes' })
  @IsInt()
  @Min(15)
  durationMinutes!: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    type: [String],
    example: ['uuid-service-1', 'uuid-service-2'],
    description: 'Array of ServiceItem IDs bundled into this package',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Package must include at least one service' })
  @IsString({ each: true })
  serviceIds!: string[];
}

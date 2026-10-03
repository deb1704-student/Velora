import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignSalonServiceDto {
  @ApiProperty({ example: 'uuid-service-id', description: 'Catalog ServiceItem ID' })
  @IsString()
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId!: string;

  @ApiPropertyOptional({ example: 4200.0, description: 'Salon-specific price override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;

  @ApiPropertyOptional({ example: 140, description: 'Salon-specific duration override in minutes' })
  @IsOptional()
  @IsInt()
  @Min(5)
  customDuration?: number;
}

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignProviderServiceDto {
  @ApiProperty({ example: 'uuid-service-id', description: 'Catalog ServiceItem ID' })
  @IsString()
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId!: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Provider certification/qualification status' })
  @IsOptional()
  @IsBoolean()
  isCertified?: boolean = true;
}

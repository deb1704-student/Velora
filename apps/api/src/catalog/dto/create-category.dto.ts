import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Hair & Styling', description: 'Name of the service category' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  name!: string;

  @ApiPropertyOptional({ example: 'Master cuts, European color techniques, and keratin treatments.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-parent-category', description: 'Parent category ID for subcategories' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}

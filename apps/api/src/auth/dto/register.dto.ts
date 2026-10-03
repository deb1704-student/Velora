import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@velora/types';

export class RegisterDto {
  @ApiProperty({ example: 'customer@velora.com', description: 'User email address' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8, description: 'Account password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({ example: 'Aarav', description: 'First name' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @ApiProperty({ example: 'Sharma', description: 'Last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    enum: UserRole,
    default: UserRole.CUSTOMER,
    description: 'Target role for new account registration',
  })
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  role: UserRole = UserRole.CUSTOMER;
}

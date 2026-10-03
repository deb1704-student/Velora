import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'customer@velora.com', description: 'Registered email address' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

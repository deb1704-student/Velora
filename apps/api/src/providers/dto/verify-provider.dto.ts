import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderVerificationStatus } from '@velora/types';

export class VerifyProviderDto {
  @ApiProperty({
    enum: ProviderVerificationStatus,
    example: ProviderVerificationStatus.APPROVED,
  })
  @IsEnum(ProviderVerificationStatus)
  status!: ProviderVerificationStatus;

  @ApiPropertyOptional({ example: 'Verified Government ID and Trade Academy Certificate' })
  @IsOptional()
  @IsString()
  reason?: string;
}

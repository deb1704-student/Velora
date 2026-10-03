import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SalonVerificationStatus } from '@velora/types';

export class VerifySalonDto {
  @ApiProperty({
    enum: SalonVerificationStatus,
    example: SalonVerificationStatus.VERIFIED,
  })
  @IsEnum(SalonVerificationStatus)
  status!: SalonVerificationStatus;
}

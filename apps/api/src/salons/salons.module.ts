import { Module } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { SalonsController } from './salons.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SalonsController],
  providers: [SalonsService],
  exports: [SalonsService],
})
export class SalonsModule {}

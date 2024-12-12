import { Module } from '@nestjs/common';
import { UcallerService } from './ucaller.service';

@Module({
  providers: [UcallerService],
  exports: [UcallerService],
})
export class UcallerModule {}

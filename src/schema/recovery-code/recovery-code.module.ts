import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryCode } from './recovery-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecoveryCode])],
  exports: [TypeOrmModule],
})
export class RecoveryCodeDBModule {}

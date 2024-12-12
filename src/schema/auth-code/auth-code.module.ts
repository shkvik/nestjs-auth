import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCode } from './auth-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthCode])],
  exports: [TypeOrmModule],
})
export class AuthCodeDBModule {}

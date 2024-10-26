import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtToken } from './jwt.token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JwtToken])],
  exports: [TypeOrmModule],
})
export class JwtTokensDBModule {}

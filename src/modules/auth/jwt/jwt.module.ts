import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtToken } from 'src/db/entities/jwt-token.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([JwtToken])],
  providers: [JwtService],
  exports: [TypeOrmModule, JwtService],
})
export class JwtModule {}

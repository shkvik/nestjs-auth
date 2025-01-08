import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtModule } from '../jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from 'src/db/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Identity]), JwtModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}

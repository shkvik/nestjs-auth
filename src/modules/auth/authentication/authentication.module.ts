import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [UsersDBModule, JwtModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}

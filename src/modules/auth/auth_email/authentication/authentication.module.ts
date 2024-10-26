import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { JwtTokensDBModule } from 'src/schema/jwt-tokens/jwt.tokens.module';
import { JwtModule } from '../../common/jwt/jwt.module';

@Module({
  imports: [UsersDBModule, JwtTokensDBModule, JwtModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}

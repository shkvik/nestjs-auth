import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { JwtModule } from '../common/jwt/jwt.module';

@Module({
  imports: [
    JwtModule,
    AuthenticationModule,
    AuthenticationModule,
  ],
})
export class AuthSmsModule {}

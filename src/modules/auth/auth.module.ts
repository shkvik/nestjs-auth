import { Module } from '@nestjs/common';
import { JwtModule } from './common/jwt/jwt.module';
import { AuthenticationModule } from './auth-email/authentication/authentication.module';
import { EmailModule } from './auth-email/services/email/email.module';
import { RecoveryModule } from './auth-email/recovery/recovery.module';
import { RegistrationModule } from './auth-email/registration/registration.module';

@Module({
  imports: [
    AuthenticationModule, 
    EmailModule, 
    JwtModule, 
    RecoveryModule, 
    RegistrationModule
  ],
})
export class AuthModule {}

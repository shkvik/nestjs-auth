import { Module } from '@nestjs/common';
import { AuthenticationModule } from './auth_email/authentication/authentication.module';
import { EmailModule } from './auth_email/services/email/email.module';
import { RecoveryModule } from './auth_email/recovery/recovery.module';
import { RegistrationModule } from './auth_email/registration/registration.module';
import { JwtModule } from './common/jwt/jwt.module';

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

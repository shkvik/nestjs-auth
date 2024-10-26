import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { EmailModule } from './email/email.module';
import { RecoveryModule } from './recovery/recovery.module';
import { RegistrationModule } from './registration/registration.module';
import { JwtModule } from './jwt/jwt.module';

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

import { Module } from '@nestjs/common';
import { AuthEmailModule } from './auth-email/auth-email.module';
import { AuthSmsModule } from './auth-sms/auth-sms.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { RegistrationModule } from './registration/registration.module';
import { RecoveryModule } from './recovery/recovery.module';
import { OAuthModule } from './oauth/oauth.module';

@Module({
  imports: [OAuthModule, RegistrationModule, AuthenticationModule, RecoveryModule, AuthSmsModule, AuthEmailModule],
})
export class AuthModule {}

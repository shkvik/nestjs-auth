import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { RegistrationModule } from './registration/registration.module';
import { RecoveryModule } from './recovery/recovery.module';
import { OAuthModule } from './oauth/oauth.module';

@Module({
  imports: [
    OAuthModule,
    RegistrationModule,
    AuthenticationModule,
    RecoveryModule,
  ],
})
export class AuthModule {}

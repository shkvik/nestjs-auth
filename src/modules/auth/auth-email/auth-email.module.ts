import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { RecoveryModule } from './recovery/recovery.module';
import { RegistrationModule } from './registration/registration.module';
import { JwtModule } from '../common/jwt/jwt.module';

@Module({
  imports: [
    JwtModule,
    AuthenticationModule,
    RecoveryModule,
    RegistrationModule,
  ],
})
export class AuthEmailModule {}

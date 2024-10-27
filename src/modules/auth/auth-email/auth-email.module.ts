import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { RecoveryModule } from './recovery/recovery.module';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [
    AuthenticationModule, 
    RecoveryModule, 
    RegistrationModule
  ],
})
export class AuthModule {}

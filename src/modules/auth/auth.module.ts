import { Module } from '@nestjs/common';
import { AuthEmailModule } from './auth-email/auth-email.module';
import { AuthSmsModule } from './auth-sms/auth-sms.module';

@Module({
  imports: [AuthSmsModule, AuthEmailModule],
})
export class AuthModule {}

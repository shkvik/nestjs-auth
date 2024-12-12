import { Module } from '@nestjs/common';
import { AuthEmailModule } from './auth-email/auth-email.module';

@Module({
  imports: [AuthEmailModule],
})
export class AuthModule {}

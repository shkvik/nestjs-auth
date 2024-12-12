import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { EmailModule } from '../services/email/email.module';

@Module({
  imports: [UsersDBModule, EmailModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

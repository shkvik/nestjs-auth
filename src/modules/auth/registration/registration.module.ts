import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { EmailModule, PhoneModule } from '../providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { AuthCode } from 'src/schema/auth-code/auth-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      AuthCode
    ]), 
    EmailModule, 
    PhoneModule
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

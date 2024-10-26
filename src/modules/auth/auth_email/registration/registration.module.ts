import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { JwtTokensDBModule } from 'src/schema/jwt-tokens/jwt.tokens.module';
import { UsersDBModule } from 'src/schema/users/users.module';
import { EmailModule } from '../../common/email/email.module';
import { JwtModule } from '../../common/jwt/jwt.module';

@Module({
  imports: [
    UsersDBModule, 
    JwtTokensDBModule, 
    JwtModule, 
    EmailModule
  ],
  controllers: [
    RegistrationController
  ],
  providers: [
    RegistrationService
  ],
  exports: [
    RegistrationService
  ],
})
export class RegistrationModule {}

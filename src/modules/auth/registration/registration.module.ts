import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { AuthCode } from 'src/db/entities/auth-code.entity';
import { IdentityModule } from '../identities/identity.module';
import { Identity } from 'src/db/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthCode, Identity]),
    IdentityModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

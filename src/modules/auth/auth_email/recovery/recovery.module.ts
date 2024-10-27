import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { JwtTokensDBModule } from 'src/schema/jwt-tokens/jwt.tokens.module';
import { JwtModule } from '../../common/jwt/jwt.module';
import { EmailModule } from '../services/email/email.module';

@Module({
  imports: [
    UsersDBModule,
    EmailModule
  ],
  controllers: [
    RecoveryController
  ],
  providers: [
    RecoveryService
  ],
})
export class RecoveryModule { }

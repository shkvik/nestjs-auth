import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { JwtTokensDBModule } from 'src/schema/jwt-tokens/jwt.tokens.module';
import { JwtModule } from '../../common/jwt/jwt.module';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [
    UsersDBModule,
    JwtTokensDBModule,
    JwtModule,
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

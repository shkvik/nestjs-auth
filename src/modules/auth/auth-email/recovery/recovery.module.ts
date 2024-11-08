import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { EmailModule } from '../services/email/email.module';
import { RecoveryCodeDBModule } from 'src/schema/recovery-code/recovery-code.module';

@Module({
  imports: [RecoveryCodeDBModule, UsersDBModule, EmailModule],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule { }

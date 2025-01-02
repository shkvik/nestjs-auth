import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { RecoveryCodeDBModule } from 'src/schema/recovery-code/recovery-code.module';
import { EmailModule, PhoneModule } from '../providers';

@Module({
  imports: [RecoveryCodeDBModule, UsersDBModule, EmailModule, PhoneModule],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule {}

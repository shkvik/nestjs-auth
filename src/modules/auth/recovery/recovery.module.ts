import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { EmailModule, PhoneModule } from '../providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { RecoveryCode } from 'src/db/entities/recovery-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RecoveryCode]),
    EmailModule,
    PhoneModule,
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule {}

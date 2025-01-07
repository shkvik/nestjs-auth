import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { RecoveryCode } from 'src/db/entities/recovery-code.entity';
import { IdentityModule } from '../identities/identity.module';
import { Identity } from 'src/db/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RecoveryCode, Identity]),
    IdentityModule,
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule {}

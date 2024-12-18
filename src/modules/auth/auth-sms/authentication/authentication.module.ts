import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { UcallerModule } from '../provider/ucaller.module';
import { AuthCodeDBModule } from 'src/schema/auth-code/auth-code.module';

@Module({
  imports: [AuthCodeDBModule, UcallerModule, UsersDBModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
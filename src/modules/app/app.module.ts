import { Module } from '@nestjs/common';
import { DBModule } from 'src/db/db.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DBModule, AuthModule],
})
export class AppModule {}

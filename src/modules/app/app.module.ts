import { Module } from '@nestjs/common';
import { SchemaModule } from 'src/schema/schema.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SchemaModule, AuthModule],
})
export class AppModule {}

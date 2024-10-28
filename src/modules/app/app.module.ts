import { Module } from '@nestjs/common';
import { ExampleModule } from '../example/example.module';
import { SchemaModule } from 'src/schema/schema.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SchemaModule,
    AuthModule,
    ExampleModule
  ],
})
export class AppModule {}

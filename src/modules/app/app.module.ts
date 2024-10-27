import { Module } from '@nestjs/common';
import { ExampleModule } from '../example/example.module';
import { SchemaModule } from 'src/schema/schema.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SchemaModule,
    AuthModule,
    ExampleModule
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ExampleModule } from '../example/example.module';
import { SchemaModule } from 'src/schema/schema.module';

@Module({
  imports: [
    SchemaModule,
    ExampleModule
  ],
})
export class AppModule {}

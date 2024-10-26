import { Module } from '@nestjs/common';
import { JwtTokensDBModule } from './jwt-tokens/jwt.tokens.module';
import { UsersDBModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceUserOption } from './datasource';

@Module({
  imports: [
    JwtTokensDBModule,
    UsersDBModule,
    TypeOrmModule.forRoot(dataSourceUserOption),
  ],
  exports: [TypeOrmModule],
})
export class SchemaModule {}

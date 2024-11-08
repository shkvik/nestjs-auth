import { Module } from '@nestjs/common';
import { JwtTokensDBModule } from './jwt-tokens/jwt.tokens.module';
import { UsersDBModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceUserOption } from './datasource';
import { RecoveryCodeDBModule } from './recovery-code/recovery-code.module';

@Module({
  imports: [
    JwtTokensDBModule,
    UsersDBModule,
    RecoveryCodeDBModule,
    TypeOrmModule.forRoot(dataSourceUserOption),
  ],
  exports: [TypeOrmModule],
})
export class SchemaModule {}

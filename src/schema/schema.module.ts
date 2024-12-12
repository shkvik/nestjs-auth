import { Module } from '@nestjs/common';
import { JwtTokensDBModule } from './jwt-tokens/jwt.tokens.module';
import { UsersDBModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceUserOption } from './datasource';
import { RecoveryCodeDBModule } from './recovery-code/recovery-code.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    JwtTokensDBModule,
    UsersDBModule,
    RecoveryCodeDBModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => dataSourceUserOption,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class SchemaModule {}

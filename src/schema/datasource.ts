import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { CONFIG_DB } from './shema.config';
import { config } from 'dotenv';

config();

export const dataSourceUserOption: DataSourceOptions = {
  type: 'postgres',
  host: CONFIG_DB.DB_HOST,
  port: CONFIG_DB.DB_PORT,
  username: CONFIG_DB.DB_USER,
  password: CONFIG_DB.DB_PASSWORD,
  database: CONFIG_DB.DB_NAME,
  migrationsTableName: 'migrations',
  migrations: [join(__dirname, 'migrations/migration-files/**.ts')],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
};

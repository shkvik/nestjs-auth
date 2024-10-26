import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// const tlsOptions: TlsOptions = {
//   ca: readFileSync(join('src/shared/schema/rds-ca-2019-root.pem')).toString(),
// };

export const dataSourceUserOption: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  migrationsTableName: 'migrations',
  migrations: [join(__dirname, 'migrations/migration-files/**.ts')],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  //ssl: tlsOptions,
  logging: false,
};

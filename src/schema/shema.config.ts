import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { validateEnv } from 'src/config/config.validate';

class ConfigDB {
  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;
}

export const CONFIG_DB = validateEnv(ConfigDB);

import { IsNotEmpty, IsString } from 'class-validator';
import { validateEnv } from 'src/config/config.validate';

export class ConfigPhone {
  @IsString()
  @IsNotEmpty()
  UCALLER_INIT_CALL_URL: string;

  @IsString()
  @IsNotEmpty()
  UCALLER_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  UCALLER_SERVICE_ID: string;
}

export const CONFIG_SMS_PROVIDER = validateEnv(ConfigPhone);

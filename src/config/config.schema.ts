import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfigApp {
  @IsString()
  @IsNotEmpty()
  NODE_ENV: string;

  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  HOST: string;

  @IsString()
  @IsNotEmpty()
  SWAGGER_PATH: string;

  @IsString()
  @IsNotEmpty()
  ADDRESS: string;
}

export class ConfigAuth {
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH: string;

  @IsString()
  @IsNotEmpty()
  JWT_RECOVERY: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXP: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXP: string;

  @IsString()
  @IsNotEmpty()
  JWT_RECOVERY_EXP: string;
}

export class ConfigEmail {
  @IsString()
  @IsNotEmpty()
  ACTIVATION_LINK: string;

  @IsString()
  @IsNotEmpty()
  REDIRECT_URL: string;

  @IsString()
  @IsNotEmpty()
  CONFIRM_EMAIL_URL: string;
}

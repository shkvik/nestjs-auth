import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmRecoveryCodeDtoReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ConfirmRecoveryCodeDtoRes {
  @IsString()
  @IsNotEmpty()
  recoveryToken: string;
}

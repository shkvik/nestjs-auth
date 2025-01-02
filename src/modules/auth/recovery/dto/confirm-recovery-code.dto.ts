import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmRecoveryCodeDtoReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ConfirmRecoveryCodeDtoRes {
  @Allow()
  recoveryToken: string;
}

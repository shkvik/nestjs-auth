import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IdentityDto } from '../../common';

export class ConfirmRecoveryCodeDtoReq extends IdentityDto {
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

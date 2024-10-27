import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ConfirmDtoReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ConfirmDtoRes {
  recoveryToken: string;
}
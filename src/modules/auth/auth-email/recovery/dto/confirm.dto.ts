import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmDtoReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ConfirmDtoRes {
  @Allow()
  recoveryToken: string;
}

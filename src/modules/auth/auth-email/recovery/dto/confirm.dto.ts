import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ConfirmDtoReq {
  @ApiProperty()
  @IsString()
  @IsUUID('all', { message: 'error' })
  @IsNotEmpty()
  activationLink: string;
}

export class ConfirmDtoRes {
  result: boolean;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmDtoReq {
  @ApiProperty({ description: 'Auth code' })
  @IsString()
  public code: string;
}

export class ConfirmDtoRes {
  @IsString()
  accessToken: string;
}

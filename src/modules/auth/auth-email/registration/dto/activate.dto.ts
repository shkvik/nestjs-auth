import { Allow, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateDtoReq {
  @ApiProperty()
  @IsString()
  @IsUUID('all', { message: 'error' })
  @IsNotEmpty()
  activationLink: string;
}

export class ActivateDtoRes {
  @Allow()
  accessToken: string;
}

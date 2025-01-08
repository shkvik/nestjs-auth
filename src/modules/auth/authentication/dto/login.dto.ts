import { ApiProperty } from '@nestjs/swagger';
import { IdentityDto } from '../../common';
import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class LoginDtoReq extends IdentityDto{
  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;
}

export class LoginDtoRes {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

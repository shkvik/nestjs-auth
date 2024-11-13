import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsStrongPassword, Allow } from 'class-validator';
import { JwtPair } from '../../../common/jwt/interface/jwt.interface';

export class LoginDtoReq {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  public password: string;
}

export class LoginDtoRes {
  @Allow()
  accessToken: string;
}
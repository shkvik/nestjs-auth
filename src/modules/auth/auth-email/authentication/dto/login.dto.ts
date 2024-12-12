import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Allow } from 'class-validator';

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
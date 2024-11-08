import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword, IsEmail } from 'class-validator';

export class CreateDtoReq {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'User password' })
  @IsStrongPassword({ 
    minLength: 8,
    minNumbers: 0,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 0,
  })
  public password: string;
}

export type CreateDtoRes = boolean;

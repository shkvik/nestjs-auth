import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, IsEmail } from 'class-validator';

export class CreateAccountDtoReq {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'User password' })
  @IsStrongPassword({ minLength: 8, minUppercase: 1 })
  public password: string;

  @ApiProperty({ description: 'Nickname of the user' })
  @IsString()
  public nickName: string;

  @ApiProperty({ description: 'First name of the user', required: false })
  @IsString()
  public firstName: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsString()
  public lastName: string;
}

export type CreateAccountDtoRes = boolean;

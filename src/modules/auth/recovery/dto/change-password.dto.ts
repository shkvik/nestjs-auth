import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDtoReq {
  @ApiProperty({ description: 'User password' })
  @IsStrongPassword({ minLength: 8, minUppercase: 1 })
  @IsNotEmpty()
  public password: string;
}

export class ChangePasswordDtoRes {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

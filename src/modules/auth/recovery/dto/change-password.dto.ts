import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDtoReq {
  @ApiProperty({ description: 'User password' })
  @IsStrongPassword({ minLength: 8, minUppercase: 1 })
  @IsNotEmpty()
  public password: string;
}

export class ChangePasswordDtoRes {
  accessToken: string;
  refreshToken: string;
}

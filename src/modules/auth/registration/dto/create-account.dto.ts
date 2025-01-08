import { ApiProperty } from '@nestjs/swagger';
import { IdentityDto } from '../../common';
import { IsStrongPassword } from 'class-validator';

export class CreateAccountDtoReq extends IdentityDto {
  @ApiProperty({
    description: 'User password',
    example: 'Qwerty!1',
  })
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 0,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 0,
  })
  public password: string;
}

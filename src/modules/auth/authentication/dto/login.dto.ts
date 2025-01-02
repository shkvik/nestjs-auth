import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, ValidateIf, IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class LoginDtoReq {
  @ApiProperty({
    required: false,
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  @ValidateIf((o: LoginDtoReq) => !o.phone)
  public email?: string;

  @ApiProperty({
    required: false,
    description: 'User phone',
    example: '+7(999) 555-22-11',
  })
  @IsPhoneNumber()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @ValidateIf((o: LoginDtoReq) => !o.email)
  public phone?: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  public password: string;
}

export class LoginDtoRes {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

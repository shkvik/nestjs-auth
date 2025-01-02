import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsStrongPassword, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateDtoReq {
  @ApiProperty({
    required: false,
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  @IsOptional()
  public email?: string;

  @ApiProperty({
    description: 'User phone',
    example: '+7(999) 555 22 11',
  })
  @IsPhoneNumber()
  @IsOptional()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  public phone?: string;

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

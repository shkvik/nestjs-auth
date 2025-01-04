import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsPhoneNumber, ValidateIf } from 'class-validator';

export class SendRecoveryCodeDtoReq {
  @ApiProperty({
    required: false,
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  @ValidateIf((o: SendRecoveryCodeDtoReq) => !o.phone)
  public email?: string;

  @ApiProperty({
    required: false,
    description: 'User phone',
    example: '+7(999) 555-22-11',
  })
  @IsPhoneNumber()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @ValidateIf((o: SendRecoveryCodeDtoReq) => !o.email)
  public phone?: string;
}

export class SendRecoveryCodeDtoRes {
  @IsBoolean()
  @IsNotEmpty()
  result: boolean;
}

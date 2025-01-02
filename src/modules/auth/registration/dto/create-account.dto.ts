import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { 
  IsStrongPassword, 
  IsEmail, 
  IsPhoneNumber, 
  ValidateIf 
} from 'class-validator';

export class CreateAccountDtoReq {
  @ApiProperty({
    required: false,
    description: 'Email address of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  @ValidateIf((o: CreateAccountDtoReq) => !o.phone)
  public email?: string;

  @ApiProperty({
    required: false,
    description: 'User phone',
    example: '+7(999) 555-22-11',
  })
  @IsPhoneNumber()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @ValidateIf((o: CreateAccountDtoReq) => !o.email)
  public phone?: string;

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

export type CreateAccountDtoRes = boolean;

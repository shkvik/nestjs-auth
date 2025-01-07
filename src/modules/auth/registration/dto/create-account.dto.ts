import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IdentityType } from 'src/db/entities';
import {
  IsStrongPassword,
  IsEmail,
  IsPhoneNumber,
  ValidateIf,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateAccountDtoReq {
  @ApiProperty({
    required: true,
    description: 'Type of the identity',
    enum: IdentityType,
    example: IdentityType.EMAIL,
  })
  @IsEnum(IdentityType)
  public identityType: IdentityType;

  @ApiProperty({
    required: false,
    description: 'Contact value (email or phone depending on contactType)',
    example: ['+7(999) 555-22-11', 'example@email.com'],
  })
  @ValidateIf((o: CreateAccountDtoReq) => o.identityType === IdentityType.EMAIL)
  @IsEmail()
  @ValidateIf((o: CreateAccountDtoReq) => o.identityType === IdentityType.PHONE)
  @Transform(({ value }) => value.replace(/\D/g, ''), { groups: [IdentityType.PHONE] })
  @IsPhoneNumber('RU', { groups: [IdentityType.PHONE] })
  @IsString()
  public contact: string;

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

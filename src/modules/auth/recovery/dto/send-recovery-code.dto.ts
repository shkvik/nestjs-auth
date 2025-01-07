import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IdentityType } from 'src/db/entities';
import { 
  IsEmail, 
  IsEnum, 
  IsPhoneNumber, 
  IsString, 
  ValidateIf 
} from 'class-validator';

export class SendRecoveryCodeDtoReq {
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
  @ValidateIf((o: SendRecoveryCodeDtoReq) => o.identityType === IdentityType.EMAIL)
  @IsEmail()
  @ValidateIf((o: SendRecoveryCodeDtoReq) => o.identityType === IdentityType.PHONE)
  @Transform(({ value }) => value.replace(/\D/g, ''), { groups: [IdentityType.PHONE] })
  @IsPhoneNumber('RU', { groups: [IdentityType.PHONE] })
  @IsString()
  public contact: string;
}

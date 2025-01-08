import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IdentityType } from "src/db/entities";
import { IsEmail, IsEnum, IsPhoneNumber, IsString, ValidateIf } from "class-validator";

const description = `
Contact value (email or phone depending on contactType)
* Email: example@email.com
* Phone: +7(999) 555-22-11
`

export class IdentityDto {
  @ApiProperty({
    required: true,
    description: 'Type of the identity',
    enum: IdentityType,
    example: IdentityType.EMAIL,
  })
  @IsEnum(IdentityType)
  public identity: IdentityType;

  @ApiProperty({
    required: true,
    description: description,
    example: 'example@email.com'
  })
  @ValidateIf((o: IdentityDto) => o.identity === IdentityType.EMAIL)
  @IsEmail()
  @ValidateIf((o: IdentityDto) => o.identity === IdentityType.PHONE)
  @Transform(({ value }) => value.replace(/\D/g, ''), { groups: [IdentityType.PHONE] })
  @IsPhoneNumber('RU', { groups: [IdentityType.PHONE] })
  @IsString()
  public contact: string;
}
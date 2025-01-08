import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IdentityDto } from '../../common';

export class ActivateAccountDtoReq extends IdentityDto {
  @ApiProperty({ description: 'Auth code' })
  @IsString()
  @IsNotEmpty()
  public code: string;
}

export class ActivateAccountDtoRes {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

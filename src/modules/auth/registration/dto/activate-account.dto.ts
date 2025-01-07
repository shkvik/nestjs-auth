import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDtoReq {
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

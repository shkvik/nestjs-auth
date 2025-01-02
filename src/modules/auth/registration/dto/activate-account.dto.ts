import { Allow, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDtoReq {
  @ApiProperty({ description: 'Auth code' })
  @IsString()
  public code: string;
}

export class ActivateAccountDtoRes {
  @Allow()
  accessToken: string;
}

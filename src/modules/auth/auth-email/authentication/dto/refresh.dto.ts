import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';

export class RefreshDtoReq {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class RefreshDtoRes {
  @Allow()
  accessToken: string;
}

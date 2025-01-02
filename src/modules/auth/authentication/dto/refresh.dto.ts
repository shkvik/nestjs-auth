import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDtoReq {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class RefreshDtoRes {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

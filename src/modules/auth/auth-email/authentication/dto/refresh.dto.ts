import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';
import { JwtPair } from '../../../common/jwt/interface/jwt.interface';

export class RefreshDtoReq {

  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class RefreshDtoRes implements JwtPair {
  @Allow()
  accessToken: string;
  @Allow()
  refreshToken: string;
}

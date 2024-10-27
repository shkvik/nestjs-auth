import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtPair } from '../../../common/jwt/interface/jwt.interface';

export class RefreshDtoReq {

  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export interface RefreshDtoRes extends JwtPair {}

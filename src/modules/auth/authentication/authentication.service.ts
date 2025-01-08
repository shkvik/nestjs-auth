import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { LoginDtoReq, LoginDtoRes } from './dto';
import { Response } from 'express';
import { RefreshDtoRes } from './dto/refresh.dto';
import { JwtAuthPayload } from '../jwt/interface/jwt.interface';
import { JwtService } from '../jwt/jwt.service';
import { Identity } from 'src/db/entities';
import {
  clearCookieRefreshToken,
  setCookieRefreshToken,
} from '../utilities/utilities.cookies';

@Injectable()
export class AuthenticationService {
  @Inject()
  private readonly jwtService: JwtService;

  @InjectRepository(Identity)
  private readonly identityRep: Repository<Identity>;

  public async login(res: Response, dto: LoginDtoReq): Promise<LoginDtoRes> {
    const identity = await this.identityRep.findOne({
      relationLoadStrategy: 'join',
      relations: { user: true },
      where: { contact: dto.contact },
    });
    if (!identity) {
      throw new BadRequestException();
    }
    const isPassEquals = await compare(dto.password, identity.user.password);
    if (!isPassEquals) {
      throw new BadRequestException();
    }
    const tokens = await this.jwtService.createJwtTokens(identity.user.id);
    setCookieRefreshToken(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
    };
  }

  public async logout(res: Response, jwt: JwtAuthPayload): Promise<void> {
    clearCookieRefreshToken(res);
    await this.jwtService.deleteToken(jwt.sessionId);
  }

  public async refresh(
    res: Response,
    jwt: JwtAuthPayload,
  ): Promise<RefreshDtoRes> {
    const tokens = await this.jwtService.updateJwtTokens(
      jwt.userId,
      jwt.sessionId,
    );
    setCookieRefreshToken(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
    };
  }
}

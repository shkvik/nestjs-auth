import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/db/entities/user.entity';
import { compare } from 'bcrypt';
import { LoginDtoReq, LoginDtoRes } from './dto';
import { Response } from 'express';
import { RefreshDtoRes } from './dto/refresh.dto';
import { JwtAuthPayload } from '../jwt/interface/jwt.interface';
import { JwtService } from '../jwt/jwt.service';
import {
  clearCookieRefreshToken,
  setCookieRefreshToken,
} from '../utilities/utilities.cookies';

@Injectable()
export class AuthenticationService {
  @Inject()
  private readonly jwtService: JwtService;

  @InjectRepository(User)
  private readonly usersRep: Repository<User>;

  public async login(res: Response, dto: LoginDtoReq): Promise<LoginDtoRes> {
    const user = await this.usersRep.findOne({
      select: { id: true, password: true },
      where: {
        isActivated: true,
        email: dto.email,
        phone: dto.phone,
      },
    });
    if (!user) {
      throw new BadRequestException();
    }
    const isPassEquals = await compare(dto.password, user.password);
    if (!isPassEquals) {
      throw new BadRequestException();
    }
    const tokens = await this.jwtService.createJwtTokens(user.id);
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

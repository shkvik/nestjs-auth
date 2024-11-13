import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../../common/jwt/jwt.service';
import { compare } from 'bcrypt';
import { LoginDtoReq, LoginDtoRes } from './dto';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';
import { Response } from 'express';
import { RefreshDtoRes } from './dto/refresh.dto';
import { 
  clearCookieRefreshToken, 
  setCookieRefreshToken 
} from '../../common/utilities/utilities.cookies';

@Injectable()
export class AuthenticationService {

  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject()
  private readonly jwtService: JwtService;

  public async login(res: Response, dto: LoginDtoReq): Promise<LoginDtoRes> {
    const user = await this.usersRepository.findOne({
      select: { id: true, password: true },
      where: { email: dto.email, is_active: true },
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
      accessToken: tokens.accessToken
    }
  }

  public async logout(res: Response, jwt: JwtAuthPayload): Promise<void> {
    clearCookieRefreshToken(res);
    await this.jwtService.deleteToken(jwt.userId, jwt.sessionId);
  }

  public async refresh(res: Response, jwt: JwtAuthPayload): Promise<RefreshDtoRes> {
    const tokens = await this.jwtService.updateJwtTokens(
      jwt.userId, 
      jwt.sessionId
    );
    setCookieRefreshToken(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken
    }
  }
}

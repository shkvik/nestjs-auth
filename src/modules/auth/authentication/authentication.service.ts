import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { Request } from 'express';
import * as useragent from 'express-useragent';
import * as bcrypt from 'bcrypt';
import { LoginDtoReq, LoginDtoRes } from './dto';

@Injectable()
class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async login(dto: { req: Request } & LoginDtoReq): Promise<LoginDtoRes> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException();
    }
    const isPassEquals = await bcrypt.compare(dto.password, user.password);
    const userAgent = useragent.parse(dto.req.headers['user-agent']);

    if (!isPassEquals) {
      throw new BadRequestException();
    }
    return this.jwtService.getAndSaveJwtTokens({
      userId: user.id,
      ip: dto.req.ip,
      browser: userAgent.browser,
      platform: userAgent.platform,
      os: userAgent.os,
    });
  }

  public async logout(request: string): Promise<string> {
    return '';
  }

  public async refreshToken(request: string): Promise<string> {
    return '';
  }
}

export { AuthenticationService };

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/schema/users/user.entity';
import { SendDtoReq, SendDtoRes } from './dto/send.dto';
import { ConfirmDtoReq, ConfirmDtoRes } from './dto/confirm.dto';
import { randomBytes } from 'crypto';
import { RefreshDtoRes } from './dto/refresh.dto';
import { Response } from 'express';
import { Transactional } from 'typeorm-transactional';
import { AuthCode } from 'src/schema/auth-code/auth-code.entity';
import { UcallerService } from '../provider/ucaller.service';
import { JwtService } from '../../common/jwt/jwt.service';
import { setCookieRefreshToken } from '../../common/utilities/utilities.cookies';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';

@Injectable()
export class AuthenticationService {
  @InjectRepository(User)
  private readonly userRep: Repository<User>;

  @InjectRepository(AuthCode)
  private readonly authCodeRep: Repository<AuthCode>;

  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly ucallerService: UcallerService;

  @Transactional()
  public async sendCode(dto: SendDtoReq): Promise<SendDtoRes> {
    const phone = dto.phone.replace(/\D/g, '');

    let user = await this.userRep.findOne({
      relationLoadStrategy: 'join',
      select: { authCode: { id: true } },
      relations: { authCode: true },
      where: { phone },
    });
    if (user && user.authCode) {
      throw new BadRequestException();
    }
    user ??= await this.userRep.save({
      phone: phone,
      isActive: false,
    });
    const secrectCode = this.getCryptoCode(4);
    await this.authCodeRep.save({
      code: secrectCode,
      user: { id: user.id },
    });
    await this.ucallerService.initCall({
      phone: Number(phone),
      code: Number(secrectCode),
      client: 'test',
    });
    return {
      statusCode: 201,
    };
  }

  @Transactional()
  public async confirmCode(
    res: Response,
    dto: ConfirmDtoReq,
  ): Promise<ConfirmDtoRes> {
    const code = await this.authCodeRep.findOne({
      relationLoadStrategy: 'join',
      relations: { user: true },
      where: { code: dto.code },
    });
    if (!code) {
      throw new BadRequestException();
    }
    code.user.isActivated = true;
    await this.authCodeRep.delete(code.id);
    await this.userRep.save(code.user);
    const { accessToken, refreshToken } = await this.jwtService.createJwtTokens(
      code.user.id,
    );

    setCookieRefreshToken(res, refreshToken);
    return { accessToken };
  }

  @Transactional()
  public async refresh(
    res: Response,
    jwt: JwtAuthPayload,
  ): Promise<RefreshDtoRes> {
    const { accessToken, refreshToken } = await this.jwtService.updateJwtTokens(
      jwt.userId,
      jwt.sessionId,
    );

    setCookieRefreshToken(res, refreshToken);
    return { accessToken };
  }

  private getCryptoCode(codeSize: number): string {
    const min = 0,
      max = 9;
    const code = Array.from({ length: codeSize }, () => {
      return min + ((randomBytes(1).readUInt8(0) % max) - min + 1);
    });
    return code.join('');
  }
}

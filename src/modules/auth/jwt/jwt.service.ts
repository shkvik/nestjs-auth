import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtToken } from 'src/schema/jwt-tokens/jwt.token.entity';
import { JwtAuthPayload, JwtPair } from './interface/jwt.interface';

const keyJwtAccess = 'change!';
const keyJwtRefresh = 'change';
const keyJwtRecoveryPassword = 'change';

@Injectable()
class JwtService {
  constructor(
    @InjectRepository(JwtToken)
    private jwtRepository: Repository<JwtToken>,
  ) {}

  public validateAccessToken(token: string): jwt.JwtPayload | string {
    try {
      return jwt.verify(token, keyJwtAccess);
    } catch {
      return null;
    }
  }

  public async deleteAllTokens(user_id: number) {
    //return await this.jwtRepository.delete({ user: user_id });
  }

  public validateRefreshToken(token: string): jwt.JwtPayload | string {
    try {
      return jwt.verify(token, keyJwtRefresh);
    } catch {
      return null;
    }
  }

  public async findTokenByUserId(user_id: number): Promise<JwtToken> {
    //return await this.jwtRepository.findOne({ where: { user_id: user_id } });
    return {
      user: null,
      ip: '',
      browser: '',
      platform: '',
      os: '',
      refresh_token: '',
      id: 0,
      version: '',
      created_at: undefined,
      updated_at: undefined
    }
  }

  public async findTokenByRefreshToken(refresh_token: string): Promise<JwtToken> {
    return await this.jwtRepository.findOne({
      where: { refresh_token: refresh_token },
    });
  }

  public async removeTokenByUserId(id: number): Promise<void> {
    //await this.jwtRepository.delete({ user_id: id });
  }

  public async getAndSaveJwtTokens(dto: JwtAuthPayload): Promise<JwtPair> {
    if (!dto.device) {
      dto.device = 'Undefined';
    }
    const { accessToken, refreshToken } = await this.generateTokens({
      userId: dto.userId,
      ip: dto.ip,
      browser: dto.browser,
      platform: dto.platform,
      os: dto.os,
      device: dto.device,
    });

    await this.saveJwtToken({ ...dto, refreshToken });

    return { accessToken, refreshToken };
  }

  public async getRecoveryPasswordToken(user_id: number): Promise<string> {
    return this.generateRecoveryToken({ user_id });
  }

  private generateTokens(payload: JwtAuthPayload): JwtPair {
    return {
      accessToken: jwt.sign(payload, keyJwtAccess),
      refreshToken: jwt.sign(payload, keyJwtRefresh, { expiresIn: '30d' }),
    };
  }

  private async generateRecoveryToken(payload: { user_id: number }): Promise<string> {
    return jwt.sign(payload, keyJwtRecoveryPassword, { expiresIn: '15m' });
  }

  private async saveJwtToken(jwtRecord: { refreshToken } & JwtAuthPayload) {
    if (await this.isTokenExist(jwtRecord)) return;

    await this.jwtRepository.save({
      user_id: jwtRecord.userId,
      ip: jwtRecord.ip,
      browser: jwtRecord.browser,
      platform: jwtRecord.platform,
      os: jwtRecord.os,
      device: jwtRecord.device,
      refresh_token: jwtRecord.refreshToken,
    });
  }

  private async isTokenExist(jwtRecord: { refreshToken } & JwtAuthPayload) {
    const findedToken = await this.jwtRepository.findOne({
      where: {
        //user_id: jwtRecord.userId,
        browser: jwtRecord.browser,
        platform: jwtRecord.platform,
        os: jwtRecord.os,
        ip: jwtRecord.ip,
        //device: jwtRecord.device,
      },
    });

    if (findedToken) {
      findedToken.refresh_token = jwtRecord.refreshToken;
      await this.jwtRepository.update(findedToken.id, findedToken);
      return true;
    } else {
      return false;
    }
  }
}

export { JwtService };

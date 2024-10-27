import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { JwtToken } from 'src/schema/jwt-tokens/jwt.token.entity';
import { JwtAuthPayload, JwtPair } from './interface/jwt.interface';
import { CONFIG_AUTH } from 'src/config/config.export';
import { randomUUID } from 'crypto';


@Injectable()
export class JwtService {

  @InjectRepository(JwtToken)
  private jwtRepository: Repository<JwtToken>;

  public getJwtPayload(token: string, key: string): JwtPayload | string {
    try {
      return verify(token, key);
    } catch {
      return null;
    }
  }

  public async deleteAllTokens(user_id: number) {
    //return await this.jwtRepository.delete({ user: user_id });
  }

  // public async findTokenByUserId(user_id: number): Promise<JwtToken> {
  //   //return await this.jwtRepository.findOne({ where: { user_id: user_id } });
  //   return {
  //     user: null,
  //     ip: '',
  //     browser: '',
  //     platform: '',
  //     os: '',
  //     refresh_token: '',
  //     id: 0,
  //     version: '',
  //     created_at: undefined,
  //     updated_at: undefined
  //   }
  // }

  public async findTokenByRefreshToken(refresh_token: string): Promise<JwtToken> {
    return await this.jwtRepository.findOne({
      where: { refresh_token: refresh_token },
    });
  }

  public async deleteToken(userId: number, sessionId: string): Promise<void> {
    await this.jwtRepository.delete({
      session_id: sessionId,
    });
  }

  public async createJwtTokens(userId: number) {
    const sessionId = randomUUID();
    const { accessToken, refreshToken } = this.generateAuthTokens({
      userId: userId,
      sessionId: sessionId
    });
    await this.jwtRepository.save({
      user: { id: userId },
      session_id: sessionId,
      refresh_token: refreshToken,
    });
    return { accessToken, refreshToken };
  }

  public async updateJwtTokens(userId: number, sessionId: string): Promise<JwtPair> {
    const token = await this.jwtRepository.findOne({
      relations: { user: true },
      where: {
        user: { id: userId },
        session_id: sessionId
      },
    });
    if (!token) {
      throw new BadRequestException();
    }
    const { accessToken, refreshToken } = this.generateAuthTokens({
      userId: userId,
      sessionId: sessionId
    });
    await this.jwtRepository.update({ id: token.id }, {
      refresh_token: refreshToken
    });
    return { accessToken, refreshToken };
  }

  public async getRecoveryToken(userId: number): Promise<string> {
    return sign({ userId }, CONFIG_AUTH.JWT_RECOVERY, {
      expiresIn: CONFIG_AUTH.JWT_RECOVERY_EXP
    });
  }

  private generateAuthTokens(payload: JwtAuthPayload): JwtPair {
    return {
      accessToken: sign(payload, CONFIG_AUTH.JWT_ACCESS, {
        expiresIn: CONFIG_AUTH.JWT_ACCESS_EXP
      }),
      refreshToken: sign(payload, CONFIG_AUTH.JWT_REFRESH, {
        expiresIn: CONFIG_AUTH.JWT_REFRESH_EXP
      }),
    };
  }
}
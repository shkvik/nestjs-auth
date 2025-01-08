import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { RecoveryCode } from 'src/db/entities/recovery-code.entity';
import { hash } from 'bcrypt';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { JwtService } from '../jwt/jwt.service';
import { IdentityService } from '../identities';
import { getCryptoCode } from '../utilities/crypto-code';
import { JwtAuthPayload } from '../jwt/interface/jwt.interface';
import { Identity } from 'src/db/entities';
import { setCookieRefreshToken } from '../utilities';
import { Response } from 'express';
import {
  ChangePasswordDtoReq,
  ChangePasswordDtoRes,
  ConfirmRecoveryCodeDtoReq,
  ConfirmRecoveryCodeDtoRes,
  SendRecoveryCodeDtoReq,
} from './dto';

@Injectable()
export class RecoveryService {
  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly identityService: IdentityService;

  @InjectRepository(User)
  private readonly userRep: Repository<User>;

  @InjectRepository(Identity)
  private readonly identityRep: Repository<Identity>;

  @InjectRepository(RecoveryCode)
  private readonly recoveryCodeRep: Repository<RecoveryCode>;

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async sendRecoveryCode(
    dto: SendRecoveryCodeDtoReq,
  ): Promise<void> {
    const identity = await this.identityRep.findOne({
      relationLoadStrategy: 'join',
      relations: { user: { recoveryCode: true } },
      where: { contact: dto.contact },
    });
    if (!identity || !identity.user.isActivated || identity.user.recoveryCode) {
      throw new BadRequestException();
    }
    const secretCode = getCryptoCode(6);
    const hashCode = await hash(secretCode, 3);

    await this.recoveryCodeRep.save({
      code: hashCode,
      user: { id: identity.user.id }
    });
    await this.identityService
      .getProvider(dto.identity)
      .sendRecoveryCode({
        to: dto.contact,
        code: secretCode,
      });
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async confirmCode(
    dto: ConfirmRecoveryCodeDtoReq,
  ): Promise<ConfirmRecoveryCodeDtoRes> {
    const identity = await this.identityRep.findOne({
      relationLoadStrategy: 'join',
      relations: { user: { recoveryCode: true } },
      where: { contact: dto.contact },
    });
    if (!identity || !identity.user.recoveryCode) {
      throw new BadRequestException();
    }
    await this.recoveryCodeRep.delete(identity.user.recoveryCode.id);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (identity.user.recoveryCode.created_at >= fiveMinutesAgo) {
      throw new BadRequestException();
    }
    const recoveryToken = await this.jwtService.getRecoveryToken(
      identity.user.id,
    );
    return { recoveryToken };
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async changePassword(
    res: Response,
    dto: ChangePasswordDtoReq,
    jwt: JwtAuthPayload,
  ): Promise<ChangePasswordDtoRes> {
    const user = await this.userRep.findOne({
      select: { id: true },
      where: { id: jwt.userId },
    });
    if (!user) {
      throw new BadRequestException();
    }
    const hashPassword = await hash(dto.password, 3);
    await this.userRep.update(user, {
      password: hashPassword,
    });
    const { accessToken, refreshToken } = await this.jwtService.createJwtTokens(jwt.userId);
    setCookieRefreshToken(res, refreshToken);
    return { accessToken };
  }
}

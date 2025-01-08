import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { User } from 'src/db/entities/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { Response } from 'express';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { setCookieRefreshToken } from '../utilities/utilities.cookies';
import { getCryptoCode } from '../utilities/crypto-code';
import { AuthCode } from 'src/db/entities/auth-code.entity';
import { IdentityService } from '../identities';
import { Identity } from 'src/db/entities';
import {
  ActivateAccountDtoReq,
  ActivateAccountDtoRes,
  CreateAccountDtoReq,
} from './dto';

@Injectable()
export class RegistrationService {
  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly identityService: IdentityService;

  @InjectRepository(User)
  private readonly userRep: Repository<User>;

  @InjectRepository(Identity)
  private readonly identityRep: Repository<Identity>;

  @InjectRepository(AuthCode)
  private readonly authCodeRep: Repository<AuthCode>;

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async createAccount(
    dto: CreateAccountDtoReq,
  ): Promise<void> {
    let identity = await this.identityRep.findOne({
      relationLoadStrategy: 'join',
      relations: { user: { authCode: true } },
      where: { contact: dto.contact },
    });
    if (identity || identity?.user?.isActivated || identity?.user?.authCode) {
      throw new ConflictException();
    }
    const secretCode = getCryptoCode(4);
    const hashCode = await hash(secretCode, 3);
    const hashPassword = await hash(dto.password, 3);
    const user = await this.userRep.save({
      password: hashPassword,
    });
    identity = await this.identityRep.save({
      type: dto.identity,
      contact: dto.contact,
      user: { id: user.id },
    });
    await this.authCodeRep.save({
      code: hashCode,
      user: { id: user.id },
    });
    await this.identityService
      .getProvider(dto.identity)
      .sendAuthCode({
        to: dto.contact,
        code: secretCode,
      });
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async activateAccount(
    res: Response,
    dto: ActivateAccountDtoReq,
  ): Promise<ActivateAccountDtoRes> {
    const identity = await this.identityRep.findOne({
      relationLoadStrategy: 'join',
      relations: { user: { authCode: true } },
      where: { contact: dto.contact },
    });
    if (!identity || identity.user.isActivated) {
      throw new BadRequestException();
    }
    const isCodeEquals = await compare(dto.code, identity.user.authCode.code);
    if (!isCodeEquals) {
      throw new BadRequestException();
    }
    await this.authCodeRep.delete(identity.user.authCode.id);
    await this.userRep.update(identity.user.id, {
      isActivated: true
    });
    const { accessToken, refreshToken } = await this.jwtService.createJwtTokens(
      identity.user.id,
    );
    setCookieRefreshToken(res, refreshToken);
    return { accessToken };
  }
}

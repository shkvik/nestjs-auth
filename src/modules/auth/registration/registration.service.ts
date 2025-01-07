import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
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
      where: { data: dto.contact },
    });
    if (identity || identity.user.isActivated || identity.user.authCode) {
      throw new ConflictException();
    }
    const secretCode = getCryptoCode(4);
    const hashCode = await hash(secretCode, 3);
    const hashPassword = await hash(dto.password, 3);
    const user = await this.userRep.save({
      password: hashPassword,
    });
    identity = await this.identityRep.save({
      type: dto.identityType,
      data: dto.contact,
      user,
    });
    await this.authCodeRep.save({
      code: hashCode,
      user: { id: user.id },
    });
    await this.identityService
      .getProvider(dto.identityType)
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
}

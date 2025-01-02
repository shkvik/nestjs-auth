import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { Response } from 'express';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { setCookieRefreshToken } from '../utilities/utilities.cookies';
import { getCryptoCode } from '../utilities/crypto-code';
import { AuthCode } from 'src/schema/auth-code/auth-code.entity';
import { EmailService, PhoneService } from '../providers';
import { 
  ActivateAccountDtoReq, 
  ActivateAccountDtoRes, 
  CreateAccountDtoReq, 
  CreateAccountDtoRes 
} from './dto';

@Injectable()
export class RegistrationService {
  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly phoneService: PhoneService;

  @Inject()
  private readonly emailService: EmailService;

  @InjectRepository(User)
  private readonly userRep: Repository<User>;

  @InjectRepository(AuthCode)
  private readonly authCodeRep: Repository<AuthCode>;

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async createAccount(dto: CreateAccountDtoReq): Promise<CreateAccountDtoRes> {
    let user = await this.userRep.findOne({
      relationLoadStrategy: 'join',
      relations: { authCode: true },
      select: { id: true },
      where: [
        { email: dto.email },
        { phone: dto.phone }
      ],
    });
    if (user && user.authCode) {
      throw new ConflictException();
    }
    const secretCode = getCryptoCode(4);
    const hashCode = await hash(secretCode, 3);
    const hashPassword = await hash(dto.password, 3);

    user = await this.userRep.save({
      email: dto.email,
      phone: dto.phone,
      password: hashPassword,
    });
    await this.authCodeRep.save({
      code: hashCode,
      user: { id: user.id },
    });
    if (dto.email) {
      await this.emailService.sendActivationCode({
        to: dto.email,
        code: secretCode,
      });
      return;
    }
    if (dto.phone) {
      await this.phoneService.initCall({
        phone: Number(dto.phone),
        code: Number(secretCode),
        client: 'test',
      });
      return;
    }
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

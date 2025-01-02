import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { RecoveryCode } from 'src/db/entities/recovery-code.entity';
import { hash } from 'bcrypt';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { JwtService } from '../jwt/jwt.service';
import { EmailService, PhoneService } from '../providers';
import { getCryptoCode } from '../utilities/crypto-code';
import { JwtAuthPayload } from '../jwt/interface/jwt.interface';
import {
  ChangePasswordDtoReq,
  ChangePasswordDtoRes,
  ConfirmRecoveryCodeDtoReq,
  ConfirmRecoveryCodeDtoRes,
  SendRecoveryCodeDtoReq,
  SendRecoveryCodeDtoRes,
} from './dto';

@Injectable()
export class RecoveryService {
  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly smsProviderService: PhoneService;

  @Inject()
  private readonly emailProviderService: EmailService;

  @InjectRepository(User)
  private readonly userRep: Repository<User>;

  @InjectRepository(RecoveryCode)
  private readonly recoveryCodeRep: Repository<RecoveryCode>;

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async sendRecoveryCode(
    dto: SendRecoveryCodeDtoReq,
  ): Promise<SendRecoveryCodeDtoRes> {
    const user = await this.userRep.findOne({
      relationLoadStrategy: 'join',
      relations: { recoveryCode: true },
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
    if (!user || user.recoveryCode) {
      throw new BadRequestException();
    }
    const secretCode = getCryptoCode(6);
    const hashCode = await hash(secretCode, 3);

    await this.recoveryCodeRep.save({ code: hashCode, user });
    if (user.email) {
      await this.emailProviderService.sendRecoveryCode({
        to: dto.email,
        code: secretCode,
      });
      return;
    }
    if (user.phone) {
      await this.smsProviderService.initCall({
        phone: Number(dto.phone),
        code: Number(secretCode),
        client: 'test',
      });
      return;
    }
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async confirmCode(
    dto: ConfirmRecoveryCodeDtoReq,
  ): Promise<ConfirmRecoveryCodeDtoRes> {
    const recoveryCode = await this.recoveryCodeRep.findOne({
      relations: { user: true },
      where: { code: dto.code },
    });
    if (!recoveryCode) {
      throw new BadRequestException();
    }
    await this.recoveryCodeRep.delete(recoveryCode.id);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (recoveryCode.created_at >= fiveMinutesAgo) {
      throw new BadRequestException();
    }
    const recoveryToken = await this.jwtService.getRecoveryToken(
      recoveryCode.user.id,
    );
    return { recoveryToken };
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async changePassword(
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
    return this.jwtService.createJwtTokens(jwt.userId);
  }
}

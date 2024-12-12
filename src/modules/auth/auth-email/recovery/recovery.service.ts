import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { EmailService } from '../services/email/email.service';
import { JwtService } from '../../common/jwt/jwt.service';
import { SendDtoReq, SendDtoRes } from './dto/send.dto';
import { randomBytes } from 'crypto';
import { ConfirmDtoReq, ConfirmDtoRes } from './dto/confirm.dto';
import { RecoveryCode } from 'src/schema/recovery-code/recovery-code.entity';
import { ChangeDtoReq, ChangeDtoRes } from './dto/change.dto';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';
import { hash } from 'bcrypt';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class RecoveryService {
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @InjectRepository(RecoveryCode)
  private readonly recoveryCodeRepository: Repository<RecoveryCode>;

  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly emailService: EmailService;

  @Transactional()
  public async sendCode(dto: SendDtoReq): Promise<SendDtoRes> {
    const user = await this.usersRepository.findOne({
      relationLoadStrategy: 'join',
      relations: { recoveryCode: true },
      select: { id: true, recoveryCode: { id: true } },
      where: { email: dto.email },
    });
    if (!user || user.recoveryCode) {
      throw new BadRequestException();
    }
    const code = this.getCryptoCode(6);
    await this.recoveryCodeRepository.save({ code, user });
    await this.emailService.sendRecoveryCode({
      to: dto.email,
      code: code,
    });
    return { result: true };
  }

  @Transactional()
  public async confirmCode(dto: ConfirmDtoReq): Promise<ConfirmDtoRes> {
    const recoveryCode = await this.recoveryCodeRepository.findOne({
      relations: { user: true },
      where: { code: dto.code },
    });
    if (!recoveryCode) {
      throw new BadRequestException();
    }
    await this.recoveryCodeRepository.delete(recoveryCode.id);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (recoveryCode.created_at >= fiveMinutesAgo) {
      throw new BadRequestException();
    }
    const recoveryToken = await this.jwtService.getRecoveryToken(
      recoveryCode.user.id,
    );

    return { recoveryToken };
  }

  @Transactional()
  public async changePassword(
    dto: ChangeDtoReq & JwtAuthPayload,
  ): Promise<ChangeDtoRes> {
    const user = await this.usersRepository.findOne({
      select: { id: true },
      where: { id: dto.userId },
    });
    if (!user) {
      throw new BadRequestException();
    }
    const hashPassword = await hash(dto.password, 3);
    await this.usersRepository.update(user, {
      password: hashPassword,
    });
    return this.jwtService.createJwtTokens(dto.userId);
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

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


@Injectable()
export class RecoveryService {

  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @InjectRepository(RecoveryCode)
  private readonly recoveryCodeRepository: Repository<RecoveryCode>;

  @Inject()
  private readonly jwtService: JwtService;

  constructor(private readonly emailService: EmailService) { }

  public async sendCode(dto: SendDtoReq): Promise<SendDtoRes> {
    const user = await this.usersRepository.findOneBy({ email: dto.email });
    if (!user) {
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

  public async confirmCode(dto: ConfirmDtoReq): Promise<ConfirmDtoRes> {
    const recoveryCode = await this.recoveryCodeRepository.findOne({
      relations: { user: true },
      where: { code: dto.code }
    });
    if (!recoveryCode) {
      throw new BadRequestException();
    }
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await this.recoveryCodeRepository.delete(recoveryCode.id);
    if (recoveryCode.created_at >= fiveMinutesAgo) {
      throw new BadRequestException();
    }
    const recoveryToken = await this.jwtService
      .getRecoveryToken(recoveryCode.user.id);

    return { recoveryToken };
  }

  public async changePassword(dto: ChangeDtoReq & JwtAuthPayload): Promise<ChangeDtoRes> {
    const user = await this.usersRepository.findOne({
      select: { id: true },
      where: { id: dto.userId }
    });
    if (!user) {
      throw new BadRequestException();
    }
    const hashPassword = await hash(dto.password, 3);
    await this.usersRepository.update(user, {
      password: hashPassword
    });
    return this.jwtService.createJwtTokens(dto.userId);;
  }

  private getCryptoCode(codeSize: number): string {
    const min = 0, max = 99;
    let result = '';
    for (let i = 0; i < codeSize; i++) {
      const random = min + (randomBytes(4).readUInt32BE(0) % max - min + 1);
      result += String(`${random}.`);
    }
    return result;
  }
}

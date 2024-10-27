import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { EmailService } from '../services/email/email.service';
import { JwtService } from '../../common/jwt/jwt.service';
import { SendDtoReq, SendDtoRes } from './dto/send.dto';
import { randomBytes } from 'crypto';
import { ConfirmDtoReq } from './dto/confirm.dto';

@Injectable()
export class RecoveryService {

  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject()
  private readonly jwtService: JwtService;

  constructor(private readonly emailService: EmailService) {}
    
  public async sendCode(dto: SendDtoReq): Promise<SendDtoRes> {
    const user = await this.usersRepository.findOneBy({ email: dto.email });
    if (!user) {
      throw new BadRequestException();
    }
    const code = new Array(8).fill(0).map(num => {
      return this.getCryptoRandomInt(0, 100)
    });
    await this.emailService.sendRecoveryCode({
      to: dto.email,
      code: code.toString(),
    });
    return { result: true };
  }

  public async confirmCode(dto: ConfirmDtoReq): Promise<string> {
    const user = await this.usersRepository.findOneBy({ 
      activation_link: dto.activationLink
    });
    if (!user) {
      throw new BadRequestException();
    }
    const recoveryTokenSecret = await this.jwtService.getRecoveryToken(user.id);
    const redirectUrl = new URL(`${process.env.RECOVERY_REDIRECT}`);
    redirectUrl.searchParams.append('recoveryToken', recoveryTokenSecret);
    return redirectUrl.toString();
  }

  public async changePassword(dto: string): Promise<string> {
    return '';
  }

  private getCryptoRandomInt(min: number, max: number): number {
    return min + (randomBytes(4).readUInt32BE(0) % max - min + 1);
  }
}

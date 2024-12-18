import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../../common/jwt/jwt.service';
import { EmailService } from '../services/email/email.service';
import { setCookieRefreshToken } from '../../common/utilities/utilities.cookies';
import { CONFIG_EMAIL } from 'src/config/config.export';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import {
  ActivateDtoReq,
  ActivateDtoRes,
  CreateDtoReq,
  CreateDtoRes,
} from './dto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RegistrationService {
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly emailService: EmailService;

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async createAccount(dto: CreateDtoReq): Promise<CreateDtoRes> {
    const isUserExists = await this.usersRepository.findOne({
      select: { id: true },
      where: [{ email: dto.email }],
    });
    if (isUserExists) {
      throw new ConflictException(`${dto.email} already exists!`);
    }
    const hashPassword = await hash(dto.password, 3);
    await this.usersRepository.save({
      email: dto.email,
      password: hashPassword,
      activation_link: randomUUID(),
    });
    await this.emailService.sendActivationMail({
      to: dto.email,
      link: CONFIG_EMAIL.ACTIVATION_LINK,
    });
    return true;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  public async activateAccount(
    res: Response,
    dto: ActivateDtoReq,
  ): Promise<ActivateDtoRes> {
    const user = await this.usersRepository.findOne({
      select: { id: true, is_active: true },
      where: { activation_link: dto.activationLink },
    });
    if (!user || user.is_active) {
      throw new BadRequestException();
    }
    user.is_active = true;
    await this.usersRepository.update(user.id, user);
    const tokens = await this.jwtService.createJwtTokens(user.id);
    setCookieRefreshToken(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
    };
  }
}

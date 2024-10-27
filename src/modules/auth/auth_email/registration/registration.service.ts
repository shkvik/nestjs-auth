import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../../common/jwt/jwt.service';
import { EmailService } from '../services/email/email.service';
import { ActivateDtoReq, CreateDtoReq, CreateDtoRes } from './dto';
import { CONFIG_EMAIL } from 'src/config/config.export';
import { randomUUID } from 'crypto';
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


  constructor(private readonly emailService: EmailService) { }

  public async createAccount(dto: CreateDtoReq): Promise<CreateDtoRes> {
    const isUserExists = await this.usersRepository.findOne({
      where: [{ email: dto.email }],
    });
    if (isUserExists) {
      throw new ConflictException(
        `${dto.email} already exists!`,
      );
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

  public async activateAccount(dto: ActivateDtoReq): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { activation_link: dto.activationLink },
    });
    if (!user || user.is_active) {
      throw new BadRequestException();
    }
    user.is_active = true;
    await this.usersRepository.update(user.id, user);
    const { accessToken, refreshToken } = await this.jwtService
      .createJwtTokens(user.id);

    return this.getRedirectURL(accessToken, refreshToken);
  }

  public getRedirectURL(accessToken: string, refreshToken: string): string {
    const redirectUrl = new URL(CONFIG_EMAIL.REDIRECT_URL);

    redirectUrl.searchParams.append('accessToken', accessToken);
    redirectUrl.searchParams.append('refreshToken', refreshToken);

    return redirectUrl.toString();
  }
}
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { EmailService } from '../email/email.service';
import * as useragent from 'express-useragent';
import { ActivateAccountDtoReq, CreateAccountDtoReq, CreateAccountDtoRes } from './dto';

@Injectable()
class RegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  public async createAccount(dto: CreateAccountDtoReq): Promise<CreateAccountDtoRes> {
    if (!(await this.isUserEmailOrNickNameExisting(dto))) {
      const user = await this.createUser(dto);
      await this.emailService.sendActivationMail({
        to: dto.email,
        link: `${process.env.URL_DEV}/api/auth/activate-account?activation_link=${user.activation_link}`,
      });
      return true;
    } else {
      throw new ConflictException(
        `The user email: ${dto.email} nick: ${dto.nickName} already exist`,
      );
    }
  }

  public async activateAccount(dto: ActivateAccountDtoReq): Promise<string> {
    if (!dto.activationLink) {
      throw new BadRequestException();
    }

    const user = await this.usersRepository.findOne({
      where: { activation_link: dto.activationLink },
    });
    if (user) {
      if (user.is_active) {
        throw new ConflictException(
          `The user email: ${user.email} is already activated`,
        );
      } else {
        user.is_active = true;
        const userAgent = useragent.parse(dto.req.headers['user-agent']);
        await this.usersRepository.update(user.id, user);
        const { accessToken, refreshToken } = await this.jwtService.getAndSaveJwtTokens({
          userId: user.id,
          ip: dto.req.ip,
          browser: userAgent.browser,
          platform: userAgent.platform,
          os: userAgent.os,
        });
        return this.getRedirectURL(accessToken, refreshToken);
      }
    } else {
      throw new UnprocessableEntityException(
        `The activation_link [${dto.activationLink}] not exist`,
      );
    }
  }

  public getRedirectURL(accessToken: string, refreshToken: string): string {
    const redirectUrl = new URL(`http://${process.env.DOMAIN}/registration/redirect-test`);

    redirectUrl.searchParams.append('accessToken', accessToken);
    redirectUrl.searchParams.append('refreshToken', refreshToken);

    return redirectUrl.toString();
  }

  public async createUser(user: CreateAccountDtoReq): Promise<User> {
    const hashPassword = await bcrypt.hash(user.password, 3);

    return this.usersRepository.save({
      email: user.email,
      password: hashPassword,
      nick_name: user.email,
      first_name: user.nickName,
      last_name: user.lastName,
      is_active: false,
      activation_link: uuidv4(),
    });
  }

  private async isUserEmailOrNickNameExisting(dto: CreateAccountDtoReq): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: [{ email: dto.email }],
    });
    return user ? true : false;
  }
}

export { RegistrationService };

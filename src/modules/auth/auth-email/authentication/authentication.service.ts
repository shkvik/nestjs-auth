import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/schema/users/user.entity';
import { JwtService } from '../../common/jwt/jwt.service';
import { compare } from 'bcrypt';
import { LoginDtoReq, LoginDtoRes } from './dto';
import { JwtAuthPayload } from '../../common/jwt/interface/jwt.interface';
import { RefreshDtoRes } from './dto/refresh.dto';

@Injectable()
export class AuthenticationService {

  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject()
  private readonly jwtService: JwtService;

  public async login(dto: LoginDtoReq): Promise<LoginDtoRes> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException();
    }
    const isPassEquals = await compare(dto.password, user.password);
    if (!isPassEquals) {
      throw new BadRequestException();
    }
    return this.jwtService.createJwtTokens(user.id);
  }

  public async logout(jwt: JwtAuthPayload): Promise<void> {
    await this.jwtService.deleteToken(jwt.userId, jwt.sessionId);
  }

  public async refresh(jwt: JwtAuthPayload): Promise<RefreshDtoRes> {
    return this.jwtService.updateJwtTokens(jwt.userId, jwt.sessionId);
  }
}

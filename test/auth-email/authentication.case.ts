import { faker } from '@faker-js/faker/.';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { verify } from 'jsonwebtoken';
import { CONFIG_AUTH } from 'src/config/config.export';
import { hash } from 'bcrypt';
import { validateObj } from './utilities';
import {
  JwtAuthPayload,
  JwtPair,
} from 'src/modules/auth/common/jwt/interface/jwt.interface';
import {
  LoginDtoReq,
  LoginDtoRes,
  RefreshDtoRes,
} from 'src/modules/auth/auth-email/authentication/dto';

export class AuthenticationCase {
  constructor(private readonly app: INestApplication) {}

  public async login(size: number = 10): Promise<Map<number, JwtPair>> {
    const userTokens = new Map<number, JwtPair>();
    const { dtos, fakeUsers } = await this.createFakeDtoLogin(size);
    const userMap = new Map<number, User>(
      fakeUsers.map((user) => [user.id, user]),
    );

    for (const dto of dtos) {
      const req = request(this.app.getHttpServer()).post('/auth-email/login');

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      const body = res.body as LoginDtoRes;

      validateObj({ type: LoginDtoRes, obj: body });

      const { accessToken } = body;
      const cookies = res.headers['set-cookie'][0];
      const refreshToken = cookies.split(';')[0].split('%20')[1];

      const accessTokenPayload = verify(
        accessToken,
        CONFIG_AUTH.JWT_ACCESS,
      ) as JwtAuthPayload;

      const refreshTokenPayload = verify(
        refreshToken,
        CONFIG_AUTH.JWT_REFRESH,
      ) as JwtAuthPayload;

      expect(userMap.has(accessTokenPayload.userId));
      expect(userMap.has(refreshTokenPayload.userId));
      expect(accessTokenPayload.userId).toEqual(refreshTokenPayload.userId);

      const user = userMap.get(accessTokenPayload.userId);

      expect(user.email).toEqual(dto.email);

      userTokens.set(accessTokenPayload.userId, {
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
    return userTokens;
  }

  public async refreshTokens(size: number = 10): Promise<void> {
    const refreshTokens = await this.createFakeDtoRefreshTokens(size);

    for (const refreshToken of refreshTokens) {
      const res = await request(this.app.getHttpServer())
        .get('/auth-email/refresh-token')
        .set('Cookie', [`refreshToken=Bearer ${refreshToken}`])
        .expect(200);

      validateObj({ type: RefreshDtoRes, obj: res.body });
    }
  }

  public async logout(size: number = 10): Promise<void> {
    const accessTokens = await this.createFakeDtoLogout(size);

    for (const accessToken of accessTokens) {
      const res = await request(this.app.getHttpServer())
        .get('/auth-email/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({});
    }
  }

  private async createFakeUsers(size: number): Promise<{
    fakeUsers: User[];
    userInputs: Map<string, string>;
  }> {
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
    const userInputs = new Map<string, string>();
    const fakeUsers = Array.from({ length: size }, async () => {
      const password = faker.internet.password({ length: 16 });
      const email = faker.internet.email();
      userInputs.set(email, password);

      const hashPassword = await hash(password, 3);

      return usersRepository.create({
        email: email,
        password: hashPassword,
        isActivated: true,
      });
    });
    return {
      fakeUsers: await Promise.all(fakeUsers),
      userInputs,
    };
  }

  private async createFakeDtoLogout(size: number): Promise<string[]> {
    const tokens = await this.login(size);
    return Array.from(tokens).map((val) => val[1].accessToken);
  }

  private async createFakeDtoRefreshTokens(size: number): Promise<string[]> {
    const tokens = await this.login(size);
    return Array.from(tokens).map(([_, jwtPair]) => jwtPair.refreshToken);
  }

  private async createFakeDtoLogin(size: number): Promise<{
    dtos: LoginDtoReq[];
    fakeUsers: User[];
  }> {
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
    const { fakeUsers, userInputs } = await this.createFakeUsers(size);
    const savedUsers = await usersRepository.save(fakeUsers);

    return {
      fakeUsers: savedUsers,
      dtos: savedUsers.map((user) => {
        return {
          email: user.email,
          password: userInputs.get(user.email),
        } as LoginDtoReq;
      }),
    };
  }
}

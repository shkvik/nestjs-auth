import { faker } from "@faker-js/faker/.";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ActivateDtoReq, CreateDtoReq } from "src/modules/auth/auth-email/registration/dto";
import { User } from "src/schema/users/user.entity";
import { In, Repository } from "typeorm";
import * as request from 'supertest';
import { JwtAuthPayload, JwtPair } from "src/modules/auth/common/jwt/interface/jwt.interface";
import { hash } from "bcrypt";
import { validateObj } from "test/auth/utilities";
import { LoginDtoReq, LoginDtoRes } from "src/modules/auth/auth-email/authentication/dto";
import { verify } from 'jsonwebtoken';
import { CONFIG_AUTH } from "src/config/config.export";


export class AuthenticationCase {

  constructor(private readonly app: INestApplication) { }

  public async login(size: number = 10) {
    const userTokens = new Map<number, JwtPair>();
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User)
    );
    const dtos = await this.createFakeDtoLogin(size);

    for (const dto of dtos) {
      const req = request(this.app.getHttpServer()).post('/auth/login')

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      const body = res.body as LoginDtoRes;
      
      validateObj({ type: LoginDtoRes, obj: res.body });
      
      const tokenPayload = verify(
        body.accessToken, 
        CONFIG_AUTH.JWT_ACCESS
      ) as JwtAuthPayload;

      userTokens.set(tokenPayload.userId, res.body as JwtPair);
    }
    return userTokens;
  }

  private async createFakeUsers(size: number) {
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User)
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
        is_active: true,
      });
    });
    return { 
      fakeUsers: await Promise.all(fakeUsers), 
      userInputs
    }
  }

  private async createFakeDtoLogin(size: number): Promise<LoginDtoReq[]> {
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User)
    );
    const { fakeUsers, userInputs } = await this.createFakeUsers(size);
    const savedUsers = await usersRepository.save(fakeUsers);

    return savedUsers.map(user => {
      return {
        email: user.email,
        password: userInputs.get(user.email)
      } as LoginDtoReq
    });
  }

  private createFakeDtoCreate(size: number): CreateDtoReq[] {
    const fakeDtoes = Array.from({ length: size }, () => {
      return {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 16 })
      } as CreateDtoReq
    });

    return fakeDtoes;
  }
}
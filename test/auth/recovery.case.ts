import { faker } from "@faker-js/faker/.";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ActivateDtoReq, CreateDtoReq } from "src/modules/auth/auth-email/registration/dto";
import { User } from "src/schema/users/user.entity";
import { In, Repository } from "typeorm";
import * as request from 'supertest';
import { JwtAuthPayload, JwtPair } from "src/modules/auth/common/jwt/interface/jwt.interface";
import { hash } from "bcrypt";
import { validateObj } from "../../test/auth/utilities";
import { LoginDtoReq, LoginDtoRes, RefreshDtoRes } from "src/modules/auth/auth-email/authentication/dto";
import { verify } from 'jsonwebtoken';
import { CONFIG_AUTH } from "src/config/config.export";
import { RecoveryCode } from "src/schema/recovery-code/recovery-code.entity";


export class RecoveryCase {

  constructor(private readonly app: INestApplication) { }

  public async sendCode(size: number = 10) {
    // const recoveryCodeRepository = this.app.get<Repository<RecoveryCode>>(
    //   getRepositoryToken(RecoveryCode)
    // );
    // const usersRepository = this.app.get<Repository<User>>(
    //   getRepositoryToken(User)
    // );
    // const fakeUsers = Array.from({ length: size }, async () => {
    //   const hashPassword = await hash(
    //     faker.internet.password({ length: 16 }), 3
    //   );
    //   const email = faker.internet.email();

    //   return usersRepository.create({
    //     email: email,
    //     password: hashPassword,
    //     is_active: true,
    //   });
    // });
    // const createdUsers = await Promise.all(fakeUsers);
    // const savedUsers = await usersRepository.save(createdUsers);
    // const userIds = new Set();
    // for (const user of savedUsers) {
    //   const dto: SendDtoReq = {
    //     email: user.email
    //   };
    //   userIds.add(user.id);
    //   const req = request(app.getHttpServer()).post('/auth/send-code')

    //   for (const [key, value] of Object.entries(dto)) {
    //     req.field(key, value);
    //   }
    //   const res = await req.expect(201);
    //   //validateObj({ type: SendDtoRes, obj: res.body });
    // }
    // const codes = await recoveryCodeRepository.find({
    //   relations: { user: true },
    //   where: { user: { id: In(savedUsers.map(user => user.id)) } },
    // });
    // const isCorrect = codes.every(
    //   code => userIds.has(code.user.id)
    // );
    // expect(true).toEqual(isCorrect);
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

  // private async createFakeDtoLogout(size: number): Promise<string[]> {
  //   const tokens = await this.login(size);
  //   return Array.from(tokens).map(val => val[1].accessToken);
  // }

  // private async createFakeDtoRefreshTokens(size: number): Promise<string[]> {
  //   const tokens = await this.login(size);
  //   return Array.from(tokens).map(val => val[1].refreshToken);
  // }

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
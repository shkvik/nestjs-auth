import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { dataSourceUserOption } from '../src/schema/datasource';
import { User } from '../src/schema/users/user.entity';
import { JwtToken } from '../src/schema/jwt-tokens/jwt.token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/modules/app/app.module';
import { CreateDtoReq } from 'src/modules/auth/auth-email/registration/dto';
import { faker } from '@faker-js/faker';
import { EmailService } from 'src/modules/auth/auth-email/services/email/email.service';
import { hash } from 'bcrypt';
import { LoginDtoReq, LoginDtoRes } from 'src/modules/auth/auth-email/authentication/dto';
import { JwtPair } from 'src/modules/auth/common/jwt/interface/jwt.interface';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RefreshDtoRes } from 'src/modules/auth/auth-email/authentication/dto/refresh.dto';
import { RecoveryCode } from 'src/schema/recovery-code/recovery-code.entity';
import { SendDtoReq, SendDtoRes } from 'src/modules/auth/auth-email/recovery/dto/send.dto';
import { ConfirmDtoReq, ConfirmDtoRes } from 'src/modules/auth/auth-email/recovery/dto/confirm.dto';
import { AppBuilder } from './app.builder';
import { RegistrationCase } from './auth/registration.case';
import { AuthenticationCase } from './auth/authentication.case';

describe('Tests (e2e)', () => {

  let app: INestApplication;
  let builder: AppBuilder;

  beforeAll(async () => {
    builder = new AppBuilder();
    app = await builder.create();
  });

  describe('Registration', () => {
    let cases: RegistrationCase;

    beforeAll(() => {
      cases = new RegistrationCase(app);
    });

    it('Create accounts', async () => {
      await cases.createAccounts(10);
    });

    it('Activate accounts', async () => {
      await cases.activateAccounts(10);
    });
  });

  describe('Authentication', () => {
    let cases: AuthenticationCase;

    beforeAll(async () => {
      cases = new AuthenticationCase(app);
    });

    it('Login', async () => {
      await cases.login(10);
    });

    it('Refresh token', async () => {
      await cases.refreshTokens(10);
    });

    it('Logout', async () => {
      await cases.logout(10);
    });
  });

  it('Recovery', async () => {
    const recoveryCodeRepository = app.get<Repository<RecoveryCode>>(
      getRepositoryToken(RecoveryCode)
    );
    const usersRepository = app.get<Repository<User>>(
      getRepositoryToken(User)
    );
    const size = 2;
    const fakeUsers = Array.from({ length: size }, async () => {
      const hashPassword = await hash(
        faker.internet.password({ length: 16 }), 3
      );
      const email = faker.internet.email();

      return usersRepository.create({
        email: email,
        password: hashPassword,
        is_active: true,
      });
    });
    const createdUsers = await Promise.all(fakeUsers);
    const savedUsers = await usersRepository.save(createdUsers);
    const userIds = new Set();
    for (const user of savedUsers) {
      const dto: SendDtoReq = {
        email: user.email
      };
      userIds.add(user.id);
      const req = request(app.getHttpServer()).post('/auth/send-code')

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      //validateObj({ type: SendDtoRes, obj: res.body });
    }
    const codes = await recoveryCodeRepository.find({
      relations: { user: true },
      where: { user: { id: In(savedUsers.map(user => user.id)) } },
    });
    const isCorrect = codes.every(
      code => userIds.has(code.user.id)
    );
    expect(true).toEqual(isCorrect);

    const recoveryTokens: string[] = []; 
    for (const code of codes) {
      const dto: ConfirmDtoReq = {
        code: code.code
      };
      const req = request(app.getHttpServer()).post('/auth/confirm-code')

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      //validateObj({ type: ConfirmDtoRes, obj: res.body });
      recoveryTokens.push(res.body.recoveryToken);
    }
    // TODO: Change Password
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await builder.dispose()
  });
});

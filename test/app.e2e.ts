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


export function validateObj<T extends object>(params: {
  type: new (...args: any[]) => T,
  obj: any
}): T {
  const { type, obj } = params;
  const validatedObj = plainToInstance(type, obj, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedObj, {
    whitelist: true,
    skipMissingProperties: false,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedObj;
}

describe('Tests (e2e)', () => {
  const mockEmailService = {
    sendActivationMail: jest.fn(),
    sendRecoveryCode: jest.fn(),
  };

  let app: INestApplication;
  let dataSource: DataSource;
  let transactionRunner: QueryRunner;
  let usersRepository: Repository<User>;
  let jwtRepository: Repository<JwtToken>;
  let recoveryCodeRepository: Repository<RecoveryCode>;

  beforeAll(async () => {
    dataSource = new DataSource(dataSourceUserOption);
    await dataSource.initialize();

    transactionRunner = dataSource.manager.connection.createQueryRunner();
    await transactionRunner.startTransaction('SERIALIZABLE');

    usersRepository = transactionRunner.manager.getRepository(User);
    jwtRepository = transactionRunner.manager.getRepository(JwtToken);
    recoveryCodeRepository = transactionRunner.manager.getRepository(RecoveryCode);

    const moduleFixture: TestingModule = await Test
      .createTestingModule({ imports: [AppModule] })
      .overrideProvider(getRepositoryToken(JwtToken)).useValue(jwtRepository)
      .overrideProvider(getRepositoryToken(User)).useValue(usersRepository)
      .overrideProvider(getRepositoryToken(RecoveryCode)).useValue(recoveryCodeRepository)
      .overrideProvider(EmailService).useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('Registration', async () => {
    const size = 10;
    const fakeDtoes = Array.from({ length: size }, () => {
      return {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 16 })
      } as CreateDtoReq
    });
    /**
     * Sign up
     */
    for (const dto of fakeDtoes) {
      const req = request(app.getHttpServer()).post('/auth/create-account')

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      await req.expect(201);
    }
    const createdUsers = await usersRepository.find({
      where: { email: In(fakeDtoes.map((dto) => dto.email)) }
    });
    if (createdUsers.length !== size) {
      throw Error('Not all fake users were created')
    }
    /**
     * Activate account
     */
    for (const user of createdUsers) {
      await request(app.getHttpServer())
        .get('/auth/activate-account')
        .query({ activationLink: user.activation_link })
        .expect(302);
    }
    const activatedUsers = await usersRepository.find({
      where: { id: In(createdUsers.map(user => user.id)) }
    });
    const activatedIds = activatedUsers.map(user => user.id).sort();
    const createdIds = createdUsers.map(user => user.id).sort();

    expect(activatedIds).toStrictEqual(createdIds);

  });
  it('Authentication', async () => {
    const size = 100;
    const userInputs = new Map<string, string>();
    const userTokens = new Map<number, JwtPair>();

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
    const createdUsers = await Promise.all(fakeUsers);
    const savedUsers = await usersRepository.save(createdUsers);
    /**
     * Login
     */
    for (const user of savedUsers) {
      const dto = {
        email: user.email,
        password: userInputs.get(user.email)
      } as LoginDtoReq

      const req = request(app.getHttpServer()).post('/auth/login')

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      validateObj({ type: LoginDtoRes, obj: res.body });
      userTokens.set(user.id, res.body as JwtPair);
    }
    /**
     * Refresh Token
     */
    for (const user of savedUsers) {
      const { accessToken, refreshToken } = userTokens.get(user.id);
      const res = await request(app.getHttpServer())
        .get('/auth/refresh-token')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      validateObj({ type: RefreshDtoRes, obj: res.body });
    }
    /**
     * Logout
     */
    for (const user of savedUsers) {
      const { accessToken, refreshToken } = userTokens.get(user.id);
      const res = await request(app.getHttpServer())
        .get('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({});
    }
  });

  it('Recovery', async () => {
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
      validateObj({ type: SendDtoRes, obj: res.body });
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
      validateObj({ type: ConfirmDtoRes, obj: res.body });
      recoveryTokens.push(res.body.recoveryToken);
    }
    // TODO: Change Password
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await transactionRunner.rollbackTransaction();
    await dataSource.destroy();
  });
});

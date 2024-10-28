import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ModuleMetadata, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { dataSourceUserOption } from '../src/schema/datasource';
import { User } from '../src/schema/users/user.entity';
import { JwtToken } from '../src/schema/jwt-tokens/jwt.token.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/modules/app/app.module';
import { CreateDtoReq } from 'src/modules/auth/auth-email/registration/dto';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { EmailService } from 'src/modules/auth/auth-email/services/email/email.service';
import { AuthenticationModule } from 'src/modules/auth/auth-email/authentication/authentication.module';
import { AuthenticationService } from 'src/modules/auth/auth-email/authentication/authentication.service';
import { UsersDBModule } from 'src/schema/users/users.module';
import { ConfigModule } from '@nestjs/config';


function getRandomIndex(size: number) {
  return Math.floor(Math.random() * size)
}

const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', ';', ':', '"', ',', '.', '<', '>', '?', '/', '\\', '|', '~'];


describe('Tests (e2e)', () => {
  const mockEmailService = {
    sendActivationMail: jest.fn(),
    sendRecoveryMail: jest.fn(),
  };

  let app: INestApplication;
  let dataSource: DataSource;
  let transactionRunner: QueryRunner;
  let usersRepository: Repository<User>;
  let jwtRepository: Repository<JwtToken>;

  beforeAll(async () => {
    dataSource = new DataSource(dataSourceUserOption);
    await dataSource.initialize();
    transactionRunner = dataSource.manager.connection.createQueryRunner();
    await transactionRunner.startTransaction('SERIALIZABLE');

    usersRepository = transactionRunner.manager.getRepository(User);
    jwtRepository = transactionRunner.manager.getRepository(JwtToken);


    const metaData: ModuleMetadata = {
      imports: [
        AppModule,
      ],
    }

    const moduleFixture: TestingModule = await Test
      .createTestingModule(metaData)
      .overrideProvider(getRepositoryToken(JwtToken))
      .useValue(jwtRepository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(usersRepository)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
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

  beforeEach(async () => {

  });
  it('[create user] /auth/create-account POST ', async () => {
    const size = 2;
    const testArr = Array.from({ length: size }, () => {

      const randomIndex = getRandomIndex(8);
      const passwordArr = Array.from(faker.internet.password({ length: 16 }))
      passwordArr[randomIndex] = faker.helpers.arrayElement(specialChars);

      const email = faker.internet
        .email({ allowSpecialCharacters: false })

      return {
        email: email,
        password: passwordArr.join('')
      } as CreateDtoReq
    })
    for (const input of testArr) {
      const ter = request(app.getHttpServer(), {})
        .post('/auth/create-account')

      for (const [key, value] of Object.entries(input)) {
        ter.field(key, value);
      }
      console.log(input)
      await ter.expect(201);
    }
  });

  it('/ (GET)', async () => {
    return request(app.getHttpServer(), {})
      .post('/auth/login')
      .field('email', 'example@email.com')
      .field('password', 'Qwerty!1')
      .expect(201)
  });
  afterEach(async () => {
    await transactionRunner.rollbackTransaction();
  })

  afterAll(async () => {
    await transactionRunner.release();
    await dataSource.destroy();
  });
});

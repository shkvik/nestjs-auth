import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { dataSourceUserOption } from '../src/schema/datasource';
import { User } from '../src/schema/users/user.entity';
import { JwtToken } from '../src/schema/jwt-tokens/jwt.token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/modules/app/app.module';
import { SchemaModule } from '../src/schema/schema.module';


describe('Tests (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let transactionRunner: QueryRunner;
  let usersRepository: Repository<User>;
  let jwtRepository: Repository<JwtToken>;


  beforeAll(async () => {
    dataSource = new DataSource(dataSourceUserOption);
    await dataSource.initialize();
    transactionRunner = dataSource.manager.connection.createQueryRunner();
    await transactionRunner.startTransaction();

    usersRepository = transactionRunner.manager.getRepository(User);
    jwtRepository = transactionRunner.manager.getRepository(JwtToken);

  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        SchemaModule
      ],
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(JwtToken),
          useValue: jwtRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  it('/ (GET)', () => {
    const t = request(app.getHttpServer(), {})
      .post('/auth/login')
      .field('email', 'example@email.com')
      .field('password', 'Qwerty!1')
      .expect(201)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await transactionRunner.rollbackTransaction();
    await dataSource.destroy();
  });
});

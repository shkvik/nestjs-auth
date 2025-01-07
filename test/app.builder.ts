import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/modules/app/app.module';
import { dataSourceUserOption } from 'src/db/datasource';
import { JwtToken } from 'src/db/entities/jwt-token.entity';
import { RecoveryCode } from 'src/db/entities/recovery-code.entity';
import { User } from 'src/db/entities/user.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import * as cookieParser from 'cookie-parser';
import { EmailService } from 'src/modules/auth/identities';
import { AuthCode } from 'src/db/entities/auth-code.entity';


export class AppBuilder {
  private app: INestApplication;
  private dataSource: DataSource;
  private transactionRunner: QueryRunner;

  public async create(): Promise<INestApplication<unknown>> {
    initializeTransactionalContext();

    this.dataSource = new DataSource(dataSourceUserOption);
    await this.dataSource.initialize();

    this.transactionRunner =
      this.dataSource.manager.connection.createQueryRunner();
    await this.transactionRunner.startTransaction('SERIALIZABLE');

    const mockEmailService: EmailService = {
      sendAuthCode: jest.fn(),
      sendRecoveryCode: jest.fn(),
      Transporter: undefined
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(JwtToken))
      .useValue(this.transactionRunner.manager.getRepository(JwtToken))
      .overrideProvider(getRepositoryToken(User))
      .useValue(this.transactionRunner.manager.getRepository(User))
      .overrideProvider(getRepositoryToken(RecoveryCode))
      .useValue(this.transactionRunner.manager.getRepository(RecoveryCode))
      .overrideProvider(getRepositoryToken(AuthCode))
      .useValue(this.transactionRunner.manager.getRepository(AuthCode))
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    this.app = moduleFixture.createNestApplication();
    this.app.use(cookieParser());
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    return this.app.init();
  }

  public async dispose(): Promise<void> {
    await this.transactionRunner.rollbackTransaction();
    await this.dataSource.destroy();
  }
}

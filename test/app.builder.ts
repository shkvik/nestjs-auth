import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppModule } from "src/modules/app/app.module";
import { EmailService } from "src/modules/auth/auth-email/services/email/email.service";
import { dataSourceUserOption } from "src/schema/datasource";
import { JwtToken } from "src/schema/jwt-tokens/jwt.token.entity";
import { RecoveryCode } from "src/schema/recovery-code/recovery-code.entity";
import { User } from "src/schema/users/user.entity";
import { DataSource, QueryRunner } from "typeorm";

export class AppBuilder {
  private app: INestApplication;
  private dataSource: DataSource;
  private transactionRunner: QueryRunner;
  
  public async create() {
    this.dataSource = new DataSource(dataSourceUserOption);
    await this.dataSource.initialize();

    this.transactionRunner = this.dataSource.manager.connection.createQueryRunner();
    await this.transactionRunner.startTransaction('SERIALIZABLE');

    const usersRepository = this.transactionRunner.manager.getRepository(User);
    const jwtRepository = this.transactionRunner.manager.getRepository(JwtToken);
    const recoveryCodeRepository = this.transactionRunner.manager.getRepository(RecoveryCode);

    const mockEmailService = {
      sendActivationMail: jest.fn(),
      sendRecoveryCode: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test
      .createTestingModule({ imports: [AppModule] })
      .overrideProvider(getRepositoryToken(JwtToken)).useValue(jwtRepository)
      .overrideProvider(getRepositoryToken(User)).useValue(usersRepository)
      .overrideProvider(getRepositoryToken(RecoveryCode)).useValue(recoveryCodeRepository)
      .overrideProvider(EmailService).useValue(mockEmailService)
      .compile();

    this.app = moduleFixture.createNestApplication();

    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    return this.app.init();
  }

  public async dispose() {
    await this.transactionRunner.rollbackTransaction();
    await this.dataSource.destroy();
  }
}
import { INestApplication } from '@nestjs/common';
import { AppBuilder } from './app.builder';
import { RegistrationCase } from './auth-email/registration.case';
import { AuthenticationCase } from './auth-email/authentication.case';
import { RecoveryCase } from './auth-email/recovery.case';

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
      await cases.createAccounts();
    });
    it('Activate accounts', async () => {
      await cases.activateAccounts();
    });
  });
  describe('Authentication', () => {
    let cases: AuthenticationCase;

    beforeAll(async () => {
      cases = new AuthenticationCase(app);
    });
    it('Login', async () => {
      await cases.login();
    });
    it('Refresh token', async () => {
      await cases.refreshTokens();
    });
    it('Logout', async () => {
      await cases.logout();
    });
  });
  describe('Recovery', () => {
    let cases: RecoveryCase;

    beforeAll(async () => {
      cases = new RecoveryCase(app);
    });
    it('Send Code', async () => {
      await cases.sendCodes();
    });
    it('Confirm Code', async () => {
      await cases.confirmCode();
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await builder.dispose();
  });
});

import { INestApplication } from '@nestjs/common';
import { AppBuilder } from './app.builder';
import {
  AuthEmailAuthenticationCase,
  AuthEmailRecoveryCase,
  AuthEmailRegistrationCase,
} from './auth';

describe('Tests (e2e)', () => {
  let app: INestApplication;
  let builder: AppBuilder;

  beforeAll(async () => {
    builder = new AppBuilder();
    app = await builder.create();
  });

  describe('Registration', () => {
    let cases: AuthEmailRegistrationCase;
    beforeAll(() => {
      cases = new AuthEmailRegistrationCase(app);
    });
    it('Create accounts', async () => {
      await cases.createAccounts();
    });
    it('Activate accounts', async () => {
      await cases.activateAccounts();
    });
  });
  describe('Authentication', () => {
    let cases: AuthEmailAuthenticationCase;

    beforeAll(async () => {
      cases = new AuthEmailAuthenticationCase(app);
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
    let cases: AuthEmailRecoveryCase;

    beforeAll(async () => {
      cases = new AuthEmailRecoveryCase(app);
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

import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { In, Repository } from 'typeorm';
import * as request from 'supertest';
import { validateObj } from '../utilities';
import { RecoveryCode } from 'src/schema/recovery-code/recovery-code.entity';
import { AuthEmailRegistrationCase } from './auth-email.registration.case';
import {
  ConfirmDtoReq,
  ConfirmDtoRes,
  SendDtoReq,
  SendDtoRes,
} from 'src/modules/auth/auth-email/recovery/dto';

export class AuthEmailRecoveryCase {
  constructor(private readonly app: INestApplication) {}

  public async sendCodes(size: number = 10): Promise<RecoveryCode[]> {
    const recoveryCodeRepository = this.app.get<Repository<RecoveryCode>>(
      getRepositoryToken(RecoveryCode),
    );
    const savedUsers = await this.createFakeActivatedUsers(size);
    const userIds = new Set();

    for (const user of savedUsers) {
      const dto: SendDtoReq = {
        email: user.email,
      };
      userIds.add(user.id);
      const req = request(this.app.getHttpServer()).post(
        '/auth-email/send-code',
      );

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      validateObj({ type: SendDtoRes, obj: res.body });
    }
    const codes = await recoveryCodeRepository.find({
      relations: { user: true },
      where: { user: { id: In(savedUsers.map((user) => user.id)) } },
    });
    const isCorrect = codes.every((code) => userIds.has(code.user.id));
    expect(true).toEqual(isCorrect);

    return codes;
  }

  public async confirmCode(size: number = 10): Promise<void> {
    const codes = await this.sendCodes(size);
    const recoveryTokens: string[] = [];
    for (const code of codes) {
      const dto: ConfirmDtoReq = {
        code: code.code,
      };
      const req = request(this.app.getHttpServer()).post(
        '/auth-email/confirm-code',
      );

      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      const res = await req.expect(201);
      validateObj({ type: ConfirmDtoRes, obj: res.body });
      recoveryTokens.push(res.body.recoveryToken);
    }
  }

  private async createFakeActivatedUsers(size: number): Promise<User[]> {
    return new AuthEmailRegistrationCase(this.app).activateAccounts(size);
  }
}

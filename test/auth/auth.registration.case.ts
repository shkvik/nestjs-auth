import { faker } from '@faker-js/faker/.';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { User } from 'src/db/entities/user.entity';
import { In, Repository } from 'typeorm';
import { EmailService } from 'src/modules/auth/providers';
import {
  ActivateAccountDtoReq,
  CreateAccountDtoReq,
} from 'src/modules/auth/registration/dto';

export class AuthEmailRegistrationCase {
  constructor(private readonly app: INestApplication) {}

  public async createAccounts(size: number = 10): Promise<User[]> {
    const dtos = this.createFakeDtoCreate(size);
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
    const emailService = this.app.get(EmailService);
    const emailCodes = new Map<string, string>();
    jest.spyOn(emailService, 'sendAuthCode')
      .mockImplementation(async (options: {
        to: string;
        code: string;
      }) => {
        emailCodes.set(options.to, options.code);
      });

    for (const dto of dtos) {
      const req = request(this.app.getHttpServer()).post(
        '/auth/create-account',
      );
      for (const [key, value] of Object.entries(dto)) {
        req.field(key, value);
      }
      await req.expect(201);
    }
    const createdUsers = await usersRepository.find({
      relationLoadStrategy: 'join',
      relations: { authCode: true, },
      where: { email: In(dtos.map((dto) => dto.email)) },
    });
    expect(createdUsers.length).toBe(dtos.length);
    createdUsers.forEach(user => {
      user.authCode.code = emailCodes.get(user.email)
    });
    return createdUsers;
  }

  public async activateAccounts(size: number = 10): Promise<User[]> {
    const createdUsers = await this.createAccounts(size);
    const dtos = this.createFakeDtoActivate(createdUsers);

    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
    for (const dto of dtos) {
      await request(this.app.getHttpServer())
        .post('/auth-email/activate-account')
        .field('activationLink', dto.code)
        .expect(201);
    }
    const activatedUsers = await usersRepository.find({
      where: { id: In(createdUsers.map((user) => user.id)) },
    });
    const activatedIds = activatedUsers.map((user) => user.id).sort();
    const createdIds = createdUsers.map((user) => user.id).sort();

    expect(activatedIds).toStrictEqual(createdIds);

    return activatedUsers;
  }

  private createFakeDtoActivate(users: User[]): ActivateAccountDtoReq[] {
    return users.map((user) => {
      return {
        code: user.authCode.code,
      } as ActivateAccountDtoReq;
    });
  }

  private createFakeDtoCreate(size: number): CreateAccountDtoReq[] {
    const fakeDtoes = Array.from({ length: size }, () => {
      return {
        phone: `+7 ${faker.phone.number()}`,
        email: faker.internet.email(),
        password: faker.internet.password({ length: 16 }),
      } as CreateAccountDtoReq;
    });

    return fakeDtoes;
  }
}

import { faker } from '@faker-js/faker/.';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ActivateDtoReq,
  CreateDtoReq,
} from 'src/modules/auth/auth-email/registration/dto';
import { User } from 'src/schema/users/user.entity';
import { In, Repository } from 'typeorm';
import * as request from 'supertest';

export class RegistrationCase {
  constructor(private readonly app: INestApplication) {}

  public async createAccounts(size: number = 10): Promise<User[]> {
    const dtos = this.createFakeDtoCreate(size);
    const usersRepository = this.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
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
      where: { email: In(dtos.map((dto) => dto.email)) },
    });
    expect(createdUsers.length).toBe(dtos.length);

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
        .get('/auth/activate-account')
        .query({ activationLink: dto.activationLink })
        .expect(302);
    }
    const activatedUsers = await usersRepository.find({
      where: { id: In(createdUsers.map((user) => user.id)) },
    });
    const activatedIds = activatedUsers.map((user) => user.id).sort();
    const createdIds = createdUsers.map((user) => user.id).sort();

    expect(activatedIds).toStrictEqual(createdIds);

    return activatedUsers;
  }

  private createFakeDtoActivate(users: User[]): ActivateDtoReq[] {
    return users.map((user) => {
      return {
        activationLink: user.activation_link,
      } as ActivateDtoReq;
    });
  }

  private createFakeDtoCreate(size: number): CreateDtoReq[] {
    const fakeDtoes = Array.from({ length: size }, () => {
      return {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 16 }),
      } as CreateDtoReq;
    });

    return fakeDtoes;
  }
}

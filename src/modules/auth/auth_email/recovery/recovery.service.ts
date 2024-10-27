import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { EmailService } from '../services/email/email.service';
import { JwtService } from '../../common/jwt/jwt.service';

@Injectable()
export class RecoveryService {

  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject()
  private readonly jwtService: JwtService;

  constructor(private readonly emailService: EmailService) {}
    
  public async sendEmail(dto: string): Promise<string> {
    return '';
  }

  public async confirmEmail(dto: string): Promise<string> {
    return '';
  }

  public async changePassword(dto: string): Promise<string> {
    return '';
  }

  private isUserExistAndActivated(user: User): void {}
}

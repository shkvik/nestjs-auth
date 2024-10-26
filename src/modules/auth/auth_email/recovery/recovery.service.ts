import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/users/user.entity';
import { EmailService } from '../../common/email/email.service';
import { JwtService } from '../../common/jwt/jwt.service';

@Injectable()
class RecoveryService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

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

export { RecoveryService };

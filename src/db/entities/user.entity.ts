import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { JwtToken } from './jwt.token.entity';
import { RecoveryCode } from './recovery-code.entity';
import { AuthCode } from './auth-code.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column()
  password: string;

  @Column({ default: false, name: 'is_activated' })
  isActivated: boolean;

  @Column({ nullable: true, name: 'activation_link' })
  activationLink: string;

  @OneToMany(() => JwtToken, (jwtToken) => jwtToken.user)
  jwtTokens: JwtToken[];

  @OneToOne(() => AuthCode, (authCode) => authCode.user)
  authCode: AuthCode;

  @OneToOne(() => RecoveryCode, (recoveryCode) => recoveryCode.user)
  recoveryCode: RecoveryCode;
}

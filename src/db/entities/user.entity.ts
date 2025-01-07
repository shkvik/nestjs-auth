import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { JwtToken } from './jwt-token.entity';
import { RecoveryCode } from './recovery-code.entity';
import { AuthCode } from './auth-code.entity';
import { Identity } from './identity.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column()
  password: string;

  @Column({ default: false, name: 'is_activated' })
  isActivated: boolean;

  @OneToMany(() => Identity, (userIdentity) => userIdentity.user)
  identities: Identity[];

  @OneToMany(() => JwtToken, (jwtToken) => jwtToken.user)
  jwtTokens: JwtToken[];

  @OneToOne(() => AuthCode, (authCode) => authCode.user)
  authCode: AuthCode;

  @OneToOne(() => RecoveryCode, (recoveryCode) => recoveryCode.user)
  recoveryCode: RecoveryCode;
}

import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { JwtToken } from '../jwt-tokens/jwt.token.entity';
import { RecoveryCode } from '../recovery-code/recovery-code.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  activation_link: string;

  @OneToMany(() => JwtToken, (jwtToken) => jwtToken.user)
  jwtTokens: JwtToken[];

  @OneToOne(() => RecoveryCode, (recoveryCode) => recoveryCode.user)
  recoveryCode: RecoveryCode;
}
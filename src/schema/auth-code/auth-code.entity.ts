import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'auth_codes' })
export class AuthCode extends BaseEntity {
  @OneToOne(() => User, (user) => user.authCode)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ comment: 'Auth code' })
  code: string;
}

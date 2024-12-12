import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'recovery_code' })
export class RecoveryCode extends BaseEntity {
  @Column()
  code: string;

  @OneToOne(() => User, (user) => user.recoveryCode)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

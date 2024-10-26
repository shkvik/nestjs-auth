import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'jwt_tokens' })
export class JwtToken extends BaseEntity {

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ comment: 'ip address' })
  ip: string;

  @Column({ comment: 'browser' })
  browser: string;

  @Column({ comment: 'platform' })
  platform: string;

  @Column({ comment: 'os' })
  os: string;

  @Column({ comment: 'Refresh token' })
  refresh_token: string;
}
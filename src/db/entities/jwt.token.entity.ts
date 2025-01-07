import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'jwt_tokens' })
export class JwtToken extends BaseEntity {
  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ comment: 'Session id uuid' })
  session_id: string;

  @Column({ comment: 'Refresh token' })
  refresh_token: string;
}

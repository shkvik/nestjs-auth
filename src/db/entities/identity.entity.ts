import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum IdentityType {
  EMAIL = 'Email',
  PHONE = 'Phone'
}

@Entity({ name: 'identities' })
export class Identity extends BaseEntity {
  @Column({ 
    type: 'enum', 
    enum: IdentityType, 
    enumName: 'identity type' 
  })
  type: IdentityType;

  @Column({ unique: true })
  data?: string;

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

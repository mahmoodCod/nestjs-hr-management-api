import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenHash: string;

  @CreateDateColumn()
  createAt: Date;

  @ManyToMany(() => User, (user) => user.refreshTokens)
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;
}

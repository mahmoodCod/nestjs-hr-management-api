import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;
}

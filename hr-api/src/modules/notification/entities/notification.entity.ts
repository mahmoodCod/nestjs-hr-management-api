import { User } from 'src/modules/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationType } from '../enums/notification.type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ name: 'userId' })
  userId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId: number; // For example, leave request id

  @Column({ name: 'related_entity_type', nullable: true, length: 50 })
  relatedEntityType: string; // example:'leave_request'

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}

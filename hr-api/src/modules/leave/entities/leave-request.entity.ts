import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveType } from './leave-type.entity';
import { LeaveRequestStatusEnum } from 'src/modules/leave/enums/leave-request.enum';
import { User } from 'src/modules/auth/entities/user.entity';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  // user association
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ name: 'userId' })
  userId: number;

  // leave type association
  @ManyToOne(() => LeaveType)
  @JoinColumn({ name: 'leave_typeId' })
  leaveType: LeaveType;
  @Column({ name: 'leave_typeId' })
  leaveTypeId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  // duration days
  @Column({
    name: 'duration_days',
    type: 'decimal',
    precision: 5,
    scale: 1,
    nullable: true,
  })
  durationDays: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  // status
  @Column({
    type: 'enum',
    enum: LeaveRequestStatusEnum,
    default: LeaveRequestStatusEnum.PENDING,
  })
  status: LeaveRequestStatusEnum;

  @Column({ name: 'approvedBy', nullable: true })
  approvedBy: number;

  @Column({ name: 'approvedAt', type: 'datetime', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

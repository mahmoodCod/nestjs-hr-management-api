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
import { LeaveRequestStatusEnum } from 'src/shared/enums/leave-request.enum';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  // Association with the requesting employee (assuming you have an Employee Entity)
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
  @Column({ name: 'employee_id' })
  employeeId: number;

  // Association with the leave type
  @ManyToOne(() => LeaveType)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;
  @Column({ name: 'leave_type_id' })
  leaveTypeId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    name: 'duration_days',
    type: 'decimal',
    precision: 5,
    scale: 1,
    nullable: true,
  })
  durationDays: number; // Number of working days (can be calculated automatically)

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveRequestStatusEnum,
    default: LeaveRequestStatusEnum.PENDING,
  })
  status: LeaveRequestStatusEnum;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number; // ID of the approving employee (manager)

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

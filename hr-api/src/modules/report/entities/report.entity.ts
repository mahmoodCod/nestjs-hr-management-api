import { User } from 'src/modules/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportType } from '../enums/report.type.enum';

@Entity('report_logs')
export class ReportLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: ReportType, default: ReportType.LEAVE_REPORT })
  reportType: ReportType;

  @Column({ type: 'json', nullable: true })
  filters: any; // Saved filters (such as startDate, endDate, leaveTypeId)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

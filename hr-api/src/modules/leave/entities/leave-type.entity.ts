import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LeaveRequest } from './leave-request.entity';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string; // leave type name

  @Column({ name: 'days_per_year', type: 'int', default: 0 })
  daysPerYear: number; // leave type days per year

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ name: 'color_code', length: 7, nullable: true })
  colorCode: string; // leave type color code

  @OneToMany(() => LeaveRequest, (request) => request.leaveType)
  requests: LeaveRequest[];
}

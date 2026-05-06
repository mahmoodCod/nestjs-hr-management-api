import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;
}

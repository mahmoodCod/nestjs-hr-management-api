import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PerformanceCycle } from './performance-cycle.entity';
import { User } from 'src/modules/auth/entities/user.entity';

/**
 * PerformanceEvaluation entity
 * Stores the overall evaluation result for an employee in a specific cycle
 */
@Entity('performance_evaluations')
export class PerformanceEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  // The cycle this evaluation belongs to
  @ManyToOne(() => PerformanceCycle)
  @JoinColumn({ name: 'cycle_id' })
  cycle: PerformanceCycle;
  @Column({ name: 'cycle_id' })
  cycleId: number;

  // The employee being evaluated
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;
  @Column({ name: 'employee_id' })
  employeeId: number;

  // The manager/reviewer who performed the evaluation
  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;
  @Column({ name: 'reviewer_id' })
  reviewerId: number;
}

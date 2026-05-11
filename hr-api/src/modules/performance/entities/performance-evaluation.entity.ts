import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PerformanceCycle } from './performance-cycle.entity';

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
}

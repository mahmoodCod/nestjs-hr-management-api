import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CycleStatus } from '../enums/cycle-status.enum';
import { PerformanceKpi } from './performance-kpi.entity';
import { PerformanceEvaluation } from './performance-evaluation.entity';

/**
 * PerformanceCycle entity
 * Represents a performance appraisal period (e.g., Q1 2026, Annual 2025)
 * Contains multiple KPIs and multiple employee evaluations
 */
@Entity('performance_cycles')
export class PerformanceCycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // e.g., "Q1 2026 Performance"

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: CycleStatus, default: CycleStatus.DRAFT })
  status: CycleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @OneToMany(() => PerformanceKpi, (kpi) => kpi.cycle, { cascade: true })
  kpis: PerformanceKpi[];

  @OneToMany(() => PerformanceEvaluation, (eval) => eval.cycle)
  evaluations: PerformanceEvaluation[];
}

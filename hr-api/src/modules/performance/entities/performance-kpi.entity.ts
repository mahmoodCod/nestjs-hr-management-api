import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PerformanceCycle } from './performance-cycle.entity';

/**
 * KPI (Key Performance Indicator) entity
 * Each KPI belongs to a performance cycle and has a weight and max score
 */
@Entity('kpis')
export class PerformanceKpi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string; // e.g., "Task Completion Rate"

  @Column({ type: 'text', nullable: true })
  description: string; // Detailed explanation of the KPI

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  weight: number; // Weight for final score calculation (0-1). Sum of all KPIs in a cycle should be 1

  @Column({ name: 'max_score', type: 'int', default: 100 })
  maxScore: number; // Maximum achievable score for this KPI

  // Relations
  @ManyToOne(() => PerformanceCycle, (cycle) => cycle.kpis, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cycle_id' })
  cycle: PerformanceCycle;
  @Column({ name: 'cycle_id' })
  cycleId: number;
}

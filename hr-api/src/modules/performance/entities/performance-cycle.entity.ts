import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}

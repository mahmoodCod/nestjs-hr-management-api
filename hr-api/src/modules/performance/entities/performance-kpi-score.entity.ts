import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PerformanceEvaluation } from './performance-evaluation.entity';
import { PerformanceKpi } from './performance-kpi.entity';

/**
 * KpiScore entity
 * Stores the score and remarks for a specific KPI within a specific evaluation
 */
@Entity('kpi_scores')
export class KpiScore {
  @PrimaryGeneratedColumn()
  id: number;

  // The evaluation this score belongs to
  @ManyToOne(() => PerformanceEvaluation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: PerformanceEvaluation;
  @Column({ name: 'evaluation_id' })
  evaluationId: number;

  // The KPI that is being scored
  @ManyToOne(() => PerformanceKpi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kpi_id' })
  kpi: PerformanceKpi;
  @Column({ name: 'kpi_id' })
  kpiId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number; // Actual score achieved (0 to kpi.maxScore)

  @Column({ type: 'text', nullable: true })
  remarks: string; // Comments specific to this KPI
}

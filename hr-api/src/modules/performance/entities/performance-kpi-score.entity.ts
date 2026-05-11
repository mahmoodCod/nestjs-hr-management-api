import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PerformanceEvaluation } from './performance-evaluation.entity';

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
}

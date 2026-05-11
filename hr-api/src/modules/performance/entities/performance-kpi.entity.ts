import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}

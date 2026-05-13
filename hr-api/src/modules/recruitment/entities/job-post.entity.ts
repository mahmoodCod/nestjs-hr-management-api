import { Department } from 'src/modules/departments/entities/department.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * JobPost entity
 * Represents a job opening in the company
 */
@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
  @Column({ name: 'department_id' })
  departmentId: number;
}

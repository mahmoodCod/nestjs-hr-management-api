import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { JobPost } from './job-post.entity';
import { ApplicationStage } from '../enums/application-stage.enum';

/**
 * Application entity
 * Links a candidate to a job post and tracks the recruitment process
 */
@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobPost)
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;
  @Column({ name: 'job_post_id' })
  jobPostId: number;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;
  @Column({ name: 'candidate_id' })
  candidateId: number;

  @Column({
    type: 'enum',
    enum: ApplicationStage,
    enumName: 'application_stage_enum',
    default: ApplicationStage.RECEIVED,
  })
  stage: ApplicationStage;

  @Column({ type: 'text', nullable: true })
  notes: string; // Internal notes from HR/manager

  @Column({ name: 'interview_score', type: 'int', nullable: true })
  interviewScore: number; // 0-100 rating

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'applied_date' })
  appliedDate: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

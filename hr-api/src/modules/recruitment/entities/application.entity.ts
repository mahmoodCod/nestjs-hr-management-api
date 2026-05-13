import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { JobPost } from './job-post.entity';

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
}

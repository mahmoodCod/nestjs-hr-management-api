import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from '../entities/job-post.entity';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { Application } from '../entities/application.entity';
import { CreateJobPostDto } from '../dto/create-job-post.dto';

/**
 * Recruitment Service
 * Handles business logic for job posts, candidates, and applications.
 * Provides methods for managers (full CRUD) and employees (apply, view own).
 */
@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostRepo: Repository<JobPost>,
    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
  ) {}

  // ==================== Job Posts (Manager only) ====================

  /**
   * Create a new job opening
   * param dto - job post data (title, description, department, etc.)
   * returns created JobPost entity
   */
  async createJobPost(dto: CreateJobPostDto): Promise<JobPost> {
    const jobPost = this.jobPostRepo.create(dto);
    return await this.jobPostRepo.save(jobPost);
  }

  /**
   * Retrieve all job posts with department relations
   * returns array of JobPost
   */
  async findAllJobPosts(): Promise<JobPost[]> {
    return await this.jobPostRepo.find({ relations: ['department'] });
  }

  /**
   * Get a single job post by ID with its department
   * param id - job post ID
   * throws NotFoundException if not exists
   */
  async findOneJobPost(id: number): Promise<JobPost> {
    const jobPost = await this.jobPostRepo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!jobPost) throw new NotFoundException('Job post not found');
    return jobPost;
  }
}

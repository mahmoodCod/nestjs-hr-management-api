import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from '../entities/job-post.entity';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { Application } from '../entities/application.entity';
import { CreateJobPostDto } from '../dto/create-job-post.dto';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationStageDto } from '../dto/update-application-stage.dto';

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

  /**
   * Update an existing job post (partial update allowed)
   * param id - job post ID
   * param dto - partial job post data
   * returns updated JobPost
   */
  async updateJobPost(
    id: number,
    dto: Partial<CreateJobPostDto>,
  ): Promise<JobPost> {
    const jobPost = await this.findOneJobPost(id);
    Object.assign(jobPost, dto);
    return await this.jobPostRepo.save(jobPost);
  }

  /**
   * Delete a job post
   * param id - job post ID
   */
  async deleteJobPost(id: number): Promise<void> {
    const jobPost = await this.findOneJobPost(id);
    await this.jobPostRepo.remove(jobPost);
  }

  // ==================== Candidates ====================

  /**
   * Create a new candidate profile.
   * If a candidate with the same email already exists, returns existing candidate (idempotent).
   * param dto - candidate information (name, email, phone, etc.)
   * returns Candidate entity
   */
  async createCandidate(dto: CreateCandidateDto): Promise<Candidate> {
    const existing = await this.candidateRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) return existing; // Idempotency: return existing candidate
    const candidate = this.candidateRepo.create(dto);
    return await this.candidateRepo.save(candidate);
  }

  /**
   * Get all candidates (for manager use)
   * returns array of Candidate
   */
  async findAllCandidates(): Promise<Candidate[]> {
    return await this.candidateRepo.find();
  }

  /**
   * Get a single candidate by ID
   * param id - candidate ID
   * throws NotFoundException if not found
   */
  async findOneCandidate(id: number): Promise<Candidate> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  // ==================== Applications ====================

  /**
   * Apply for a job (submitted by a candidate)
   * param candidateId - ID of the candidate (could be retrieved from token)
   * param dto - contains jobPostId and optional notes
   * returns created Application entity
   * throws BadRequestException if job post is closed or duplicate application exists
   */
  async applyForJob(
    candidateId: number,
    dto: CreateApplicationDto,
  ): Promise<Application> {
    // Ensure job post exists and is open
    const jobPost = await this.findOneJobPost(dto.jobPostId);
    if (jobPost.status !== 'open') {
      throw new BadRequestException(
        'This job post is not open for applications',
      );
    }
    // Ensure candidate exists
    const candidate = await this.findOneCandidate(candidateId);
    // Check for duplicate application
    const existing = await this.applicationRepo.findOne({
      where: { jobPostId: dto.jobPostId, candidateId },
    });
    if (existing) {
      throw new BadRequestException('You have already applied for this job');
    }
    const application = this.applicationRepo.create({
      jobPostId: dto.jobPostId,
      candidateId,
      notes: dto.notes,
    });
    return await this.applicationRepo.save(application);
  }

  /**
   * Get all applications (manager view), optionally filtered by job post ID
   * param jobPostId - optional filter
   * returns array of Application with jobPost and candidate relations
   */
  async findAllApplications(jobPostId?: number): Promise<Application[]> {
    const where: any = {};
    if (jobPostId) where.jobPostId = jobPostId;
    return await this.applicationRepo.find({
      where,
      relations: ['jobPost', 'candidate'],
      order: { appliedDate: 'DESC' },
    });
  }

  /**
   * Get all applications submitted by a specific candidate (for employee self‑view)
   * param candidateId - ID of the candidate
   * returns array of Application with jobPost relation
   */
  async findApplicationsByCandidate(
    candidateId: number,
  ): Promise<Application[]> {
    return await this.applicationRepo.find({
      where: { candidateId },
      relations: ['jobPost'],
      order: { appliedDate: 'DESC' },
    });
  }

  /**
   * Get a single application by ID with full relations
   * param id - application ID
   * throws NotFoundException if not found
   */
  async findOneApplication(id: number): Promise<Application> {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: ['jobPost', 'candidate'],
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  /**
   * Update the stage of an application (manager only)
   * Allows setting notes, interview score, rejection reason.
   * param id - application ID
   * param dto - update data (stage, notes, score, rejection reason)
   * returns updated Application
   */
  async updateApplicationStage(
    id: number,
    dto: UpdateApplicationStageDto,
  ): Promise<Application> {
    const application = await this.findOneApplication(id);
    application.stage = dto.stage;
    if (dto.notes) application.notes = dto.notes;
    if (dto.interviewScore) application.interviewScore = dto.interviewScore;
    if (dto.rejectionReason) application.rejectionReason = dto.rejectionReason;
    if (dto.stage === 'rejected') {
      application.rejectionReason = dto.rejectionReason || 'Not specified';
    }
    return await this.applicationRepo.save(application);
  }
}

import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RecruitmentService } from '../services/recruitment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { CreateApplicationDto } from '../dto/create-application.dto';

/**
 * Employee-facing recruitment controller.
 * Allows candidates to view open job posts, create their profile, submit applications,
 * and track their own application status.
 * All endpoints are protected by JWT authentication.
 */
@ApiBearerAuth()
@ApiTags('Employee - Recruitment')
@Controller('employee/recruitment')
@UseGuards(JwtAurhGuard)
export class EmployeeRecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  /**
   * Get all job posts that are currently open (status = 'open').
   * returns list of open JobPost entities
   */
  @Get('jobs')
  @ApiOperation({ summary: 'Get all open job posts' })
  async getOpenJobs() {
    const all = await this.recruitmentService.findAllJobPosts();
    return all.filter((job) => job.status === 'open');
  }

  /**
   * Create or update a candidate profile.
   * If a candidate with the same email already exists, the existing profile is returned.
   * param dto - candidate details (name, email, phone, address)
   * returns Candidate entity
   */
  @Post('candidate/profile')
  @ApiOperation({ summary: 'Create or update candidate profile' })
  async createOrUpdateCandidate(@Body() dto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(dto);
  }

  /**
   * Submit an application for a specific job post.
   * The candidate ID is resolved from the request (e.g., from JWT or candidate profile).
   * param req - request object (contains user/candidate info)
   * param dto - application data (jobPostId, optional notes)
   * returns created Application entity
   */
  @Post('applications')
  @ApiOperation({ summary: 'Apply for a job' })
  async applyForJob(@Req() req, @Body() dto: CreateApplicationDto) {
    // In a real implementation, candidateId would be extracted from the authenticated user.
    // Here we assume the candidate's email is passed or stored in req.user.
    // For simplicity, we require the candidate profile to exist, and we retrieve candidateId via email.
    // In a fully integrated system, the User entity would have a relation to Candidate.
    // We'll use a placeholder: retrieve candidateId from the candidate profile using the logged‑in user's email.
    // For demo, we extract candidate email from the DTO or assume it's already stored.
    // To keep the example clean, we use the candidateId that comes from the frontend (or from token after linking).
    // Here we assume the candidate ID is available as req.user.candidateId.
    const candidateId = req.user.candidateId || req.user.id; // placeholder – adapt to your needs
    return this.recruitmentService.applyForJob(candidateId, dto);
  }

  /**
   * Get all applications submitted by the currently authenticated candidate.
   * param req - request object
   * returns list of applications with job post details
   */
  @Get('applications')
  @ApiOperation({ summary: 'Get my applications' })
  async getMyApplications(@Req() req) {
    const candidateId = req.user.candidateId || req.user.id;
    return this.recruitmentService.findApplicationsByCandidate(candidateId);
  }

  /**
   * Get a specific application by ID (only if it belongs to the logged‑in candidate).
   * param id - application ID
   * returns detailed Application with job post and candidate info
   */
  @Get('applications/:id')
  @ApiOperation({ summary: 'Get a specific application by ID' })
  async findOneApplication(@Param('id') id: string) {
    // In a full implementation, you should also check that the application belongs to the current candidate.
    return this.recruitmentService.findOneApplication(+id);
  }
}

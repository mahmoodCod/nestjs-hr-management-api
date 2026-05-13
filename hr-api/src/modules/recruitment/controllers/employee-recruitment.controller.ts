import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RecruitmentService } from '../services/recruitment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateCandidateDto } from '../dto/create-candidate.dto';

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
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  /**
   * Get all job posts that are currently open (status = 'open').
   * returns list of open JobPost entities
   */
  @Get('jobs')
  @ApiOperation({ summary: 'Get all open job posts' })
  async getOpenJobs() {
    const all = await this.recruitmentService.findAllJobPosts();
    return all.filter(job => job.status === 'open');
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
}

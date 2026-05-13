import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { RecruitmentService } from '../services/recruitment.service';
import { CreateJobPostDto } from '../dto/create-job-post.dto';

/**
 * Manager‑facing recruitment controller.
 * Provides full CRUD for job posts, ability to view all applications and candidates,
 * and update application stages (e.g., move from screening to interview).
 * All endpoints require JWT authentication and the MANAGER role.
 */
@ApiBearerAuth()
@ApiTags('Manager - Recruitment')
@Controller('manager/recruitment')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerRecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ========== Job Post CRUD ==========

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new job posting' })
  createJobPost(@Body() dto: CreateJobPostDto) {
    return this.recruitmentService.createJobPost(dto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all job posts (any status)' })
  findAllJobPosts() {
    return this.recruitmentService.findAllJobPosts();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get a specific job post by ID' })
  findOneJobPost(@Param('id') id: string) {
    return this.recruitmentService.findOneJobPost(+id);
  }

  @Patch('jobs/:id')
  @ApiOperation({
    summary: 'Update a job post (title, description, status, etc.)',
  })
  updateJobPost(
    @Param('id') id: string,
    @Body() dto: Partial<CreateJobPostDto>,
  ) {
    return this.recruitmentService.updateJobPost(+id, dto);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete a job post' })
  deleteJobPost(@Param('id') id: string) {
    return this.recruitmentService.deleteJobPost(+id);
  }
}

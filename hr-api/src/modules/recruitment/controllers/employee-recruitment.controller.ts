import { Controller, UseGuards } from '@nestjs/common';
import { RecruitmentService } from '../services/recruitment.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';

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
}

import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { RecruitmentService } from '../services/recruitment.service';

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
}

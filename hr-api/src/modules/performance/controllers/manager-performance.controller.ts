import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { PerformanceService } from '../services/performance.service';

/**
 * Manager-facing performance controller.
 * Provides full CRUD for cycles, KPIs, and evaluations.
 * All endpoints require JWT authentication and MANAGER role.
 */
@ApiBearerAuth()
@ApiTags('Manager - Performance')
@Controller('manager/performance')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerPerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}
}

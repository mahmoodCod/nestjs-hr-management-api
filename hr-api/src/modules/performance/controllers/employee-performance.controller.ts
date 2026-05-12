import { Controller, UseGuards } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';

/**
 * Employee-facing performance controller.
 * Allows employees to view their own performance evaluations.
 * All endpoints require JWT authentication.
 */
@ApiBearerAuth()
@ApiTags('Employee - Performance')
@Controller('employee/performance')
@UseGuards(JwtAurhGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}
}

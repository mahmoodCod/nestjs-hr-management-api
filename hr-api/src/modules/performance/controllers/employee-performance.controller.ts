import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  /**
   * Get all performance evaluations for the currently authenticated employee.
   * Returns a list of evaluations with cycle information.
   */
  @Get('evaluations')
  @ApiOperation({ summary: 'Get my performance evaluations' })
  async getMyEvaluations(@Req() req) {
    const employeeId = req.user.id;
    return this.performanceService.findEvaluationsByEmployee(employeeId);
  }
}

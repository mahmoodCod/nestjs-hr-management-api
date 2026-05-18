import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { PerformanceService } from '../services/performance.service';
import { CreatePerformanceCycleDto } from '../dto/create-performance-cycle.dto';
import { CreatePerformanceKpiDto } from '../dto/create-performance-kpi.dto';
import { CreateEvaluationDto } from '../dto/create-performance-evaluation.dto';

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

  // ========== Cycle CRUD ==========
  @Post('cycles')
  @ApiOperation({ summary: 'Create a new performance cycle' })
  createCycle(@Body() dto: CreatePerformanceCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  @Get('cycles')
  @ApiOperation({ summary: 'Get all performance cycles' })
  findAllCycles() {
    return this.performanceService.findAllCycles();
  }

  @Get('cycles/:id')
  @ApiOperation({ summary: 'Get a single cycle by ID with its KPIs' })
  findOneCycle(@Param('id') id: string) {
    return this.performanceService.findOneCycle(+id);
  }

  // ========== KPI Management ==========
  @Post('cycles/:cycleId/kpis')
  @ApiOperation({ summary: 'Add a KPI to a specific cycle' })
  addKpi(
    @Param('cycleId') cycleId: string,
    @Body() dto: CreatePerformanceKpiDto,
  ) {
    return this.performanceService.addKpi(+cycleId, dto);
  }

  // ========== Evaluation Management ==========
  @Post('evaluations')
  @ApiOperation({ summary: 'Create a performance evaluation for an employee' })
  createEvaluation(@Req() req, @Body() dto: CreateEvaluationDto) {
    const reviewerId = req.user.id;
    return this.performanceService.createEvaluation(reviewerId, dto);
  }

  @Get('evaluations')
  @ApiOperation({
    summary: 'Get all evaluations (optionally filtered by cycleId)',
  })
  findAllEvaluations(@Query('cycleId') cycleId?: string) {
    return this.performanceService.findAllEvaluations(
      cycleId ? +cycleId : undefined,
    );
  }

  @Get('evaluations/:id')
  @ApiOperation({ summary: 'Get a single evaluation with all KPI scores' })
  async findOneEvaluation(@Param('id') id: string) {
    const evaluation = await this.performanceService.findOneEvaluation(+id);
    const kpiScores = await this.performanceService.getKpiScores(+id);
    return { ...evaluation, kpiScores };
  }
}

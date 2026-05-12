import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { PerformanceService } from '../services/performance.service';
import { CreatePerformanceCycleDto } from '../dto/create-performance-cycle.dto';
import { CreatePerformanceKpiDto } from '../dto/create-performance-kpi.dto';

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
}

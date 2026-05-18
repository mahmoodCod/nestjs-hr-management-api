import { Module } from '@nestjs/common';
import { PerformanceService } from './services/performance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceCycle } from './entities/performance-cycle.entity';
import { PerformanceKpi } from './entities/performance-kpi.entity';
import { PerformanceEvaluation } from './entities/performance-evaluation.entity';
import { KpiScore } from './entities/performance-kpi-score.entity';
import { User } from '../auth/entities/user.entity';
import { EmployeePerformanceController } from './controllers/employee-performance.controller';
import { ManagerPerformanceController } from './controllers/manager-performance.controller';

/**
 * Performance Module
 * Handles performance appraisal cycles, KPIs, and employee evaluations.
 * Exposes endpoints for both employees (read-only own evaluations) and managers (full CRUD).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerformanceCycle,
      PerformanceKpi,
      PerformanceEvaluation,
      KpiScore,
      User,
    ]),
  ],
  controllers: [EmployeePerformanceController, ManagerPerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformanceCycle } from '../entities/performance-cycle.entity';
import { Repository } from 'typeorm';
import { KpiScore } from '../entities/performance-kpi-score.entity';
import { PerformanceKpi } from '../entities/performance-kpi.entity';
import { PerformanceEvaluation } from '../entities/performance-evaluation.entity';
import { User } from 'src/modules/auth/entities/user.entity';

/**
 * Service for managing performance appraisal cycles, KPIs, and evaluations.
 * Provides CRUD operations and business logic for weighted score calculation.
 */
@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceCycle)
    private cycleRepo: Repository<PerformanceCycle>,
    @InjectRepository(PerformanceKpi)
    private kpiRepo: Repository<PerformanceKpi>,
    @InjectRepository(PerformanceEvaluation)
    private evaluationRepo: Repository<PerformanceEvaluation>,
    @InjectRepository(KpiScore)
    private kpiScoreRepo: Repository<KpiScore>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
}

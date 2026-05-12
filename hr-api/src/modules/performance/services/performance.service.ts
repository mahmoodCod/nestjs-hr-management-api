import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformanceCycle } from '../entities/performance-cycle.entity';
import { Repository } from 'typeorm';
import { KpiScore } from '../entities/performance-kpi-score.entity';
import { PerformanceKpi } from '../entities/performance-kpi.entity';
import { PerformanceEvaluation } from '../entities/performance-evaluation.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { CreatePerformanceCycleDto } from '../dto/create-performance-cycle.dto';
import { CreatePerformanceKpiDto } from '../dto/create-performance-kpi.dto';

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

  // ==================== Cycle Management ====================

  /**
   * Create a new performance cycle
   * param dto - cycle data
   * returns created cycle
   */
  async createCycle(dto: CreatePerformanceCycleDto): Promise<PerformanceCycle> {
    const cycle = this.cycleRepo.create(dto);
    return await this.cycleRepo.save(cycle);
  }

  /**
   * Get all performance cycles (ordered by start date descending)
   */
  async findAllCycles(): Promise<PerformanceCycle[]> {
    return await this.cycleRepo.find({ order: { startDate: 'DESC' } });
  }

  /**
   * Get a single cycle by ID with its KPIs
   * param id - cycle ID
   * throws NotFoundException if not found
   */
  async findOneCycle(id: number): Promise<PerformanceCycle> {
    const cycle = await this.cycleRepo.findOne({
      where: { id },
      relations: ['kpis'],
    });
    if (!cycle) throw new NotFoundException('Performance cycle not found');
    return cycle;
  }

  /**
   * Update a cycle (e.g., change dates, status)
   * param id - cycle ID
   * param dto - partial cycle data
   */
  async updateCycle(
    id: number,
    dto: Partial<CreatePerformanceCycleDto>,
  ): Promise<PerformanceCycle> {
    const cycle = await this.findOneCycle(id);
    Object.assign(cycle, dto);
    return await this.cycleRepo.save(cycle);
  }

  /**
   * Delete a cycle (and all associated KPIs and evaluations due to cascade)
   * param id - cycle ID
   */
  async deleteCycle(id: number): Promise<void> {
    const cycle = await this.findOneCycle(id);
    await this.cycleRepo.remove(cycle);
  }

  // ==================== KPI Management ====================

  /**
   * Add a new KPI to a specific cycle
   * param cycleId - ID of the cycle
   * param dto - KPI data
   */
  async addKpi(
    cycleId: number,
    dto: CreatePerformanceKpiDto,
  ): Promise<PerformanceKpi> {
    const cycle = await this.findOneCycle(cycleId);
    const kpi = this.kpiRepo.create({ ...dto, cycle });
    return await this.kpiRepo.save(kpi);
  }

  /**
   * Update an existing KPI
   * param kpiId - ID of the KPI
   * param dto - partial KPI data
   */
  async updateKpi(
    kpiId: number,
    dto: Partial<CreatePerformanceKpiDto>,
  ): Promise<PerformanceKpi> {
    const kpi = await this.kpiRepo.findOne({ where: { id: kpiId } });
    if (!kpi) throw new NotFoundException('KPI not found');
    Object.assign(kpi, dto);
    return await this.kpiRepo.save(kpi);
  }

  /**
   * Delete a KPI
   * param kpiId - ID of the KPI
   */
  async deleteKpi(kpiId: number): Promise<void> {
    const kpi = await this.kpiRepo.findOne({ where: { id: kpiId } });
    if (!kpi) throw new NotFoundException('KPI not found');
    await this.kpiRepo.remove(kpi);
  }
}

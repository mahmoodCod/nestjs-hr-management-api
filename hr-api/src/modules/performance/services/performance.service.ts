import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformanceCycle } from '../entities/performance-cycle.entity';
import { Repository } from 'typeorm';
import { KpiScore } from '../entities/performance-kpi-score.entity';
import { PerformanceKpi } from '../entities/performance-kpi.entity';
import { PerformanceEvaluation } from '../entities/performance-evaluation.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { CreatePerformanceCycleDto } from '../dto/create-performance-cycle.dto';
import { CreatePerformanceKpiDto } from '../dto/create-performance-kpi.dto';
import { CreateEvaluationDto } from '../dto/create-performance-evaluation.dto';
import { CycleStatus } from '../enums/cycle-status.enum';
import { EvaluationStatus } from '../enums/evaluation-status.enum';

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

  // ==================== Evaluation Management ====================

  /**
   * Create a performance evaluation for an employee (manager only)
   * Validates that all KPIs belong to the cycle, weights sum to 1, and scores are within limits.
   * Calculates final score as weighted average scaled to 0-100.
   * param reviewerId - ID of the manager creating the evaluation
   * param dto - evaluation data including KPI scores
   * returns created evaluation entity
   */
  async createEvaluation(reviewerId: number, dto: CreateEvaluationDto) {
    // Check cycle exists and is not completed
    const cycle = await this.findOneCycle(dto.cycleId);
    if (cycle.status === CycleStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot create evaluation for a completed cycle',
      );
    }

    // Check employee exists
    const employee = await this.userRepo.findOne({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    // Prevent duplicate evaluation for same employee & cycle
    const existing = await this.evaluationRepo.findOne({
      where: { employeeId: dto.employeeId, cycleId: dto.cycleId },
    });
    if (existing) {
      throw new BadRequestException(
        'Evaluation for this employee and cycle already exists',
      );
    }

    // Fetch all KPIs for the cycle
    const kpis = await this.kpiRepo.find({ where: { cycleId: dto.cycleId } });
    const kpiMap = new Map(kpis.map((k) => [k.id, k]));

    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Validate each KPI score and accumulate weighted sum
    for (const kpiScoreDto of dto.kpiScores) {
      const kpi = kpiMap.get(kpiScoreDto.kpiId);
      if (!kpi) {
        throw new BadRequestException(
          `KPI with id ${kpiScoreDto.kpiId} not found in this cycle`,
        );
      }
      if (kpiScoreDto.score < 0 || kpiScoreDto.score > kpi.maxScore) {
        throw new BadRequestException(
          `Score for KPI "${kpi.title}" must be between 0 and ${kpi.maxScore}`,
        );
      }
      const normalizedScore = kpiScoreDto.score / kpi.maxScore; // 0..1
      totalWeightedScore += normalizedScore * kpi.weight;
      totalWeight += kpi.weight;
    }

    // Check sum of weights (allow small floating point tolerance)
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new BadRequestException('Total weight of KPIs must equal 1.0');
    }

    const finalScore = totalWeightedScore * 100; // Convert to 0-100 scale

    // Create evaluation record
    const evaluation = this.evaluationRepo.create({
      cycleId: dto.cycleId,
      employeeId: dto.employeeId,
      reviewerId,
      finalScore,
      comments: dto.comments,
      status: EvaluationStatus.SUBMITTED,
    });
    const savedEvaluation = await this.evaluationRepo.save(evaluation);

    // Save individual KPI scores
    for (const kpiScoreDto of dto.kpiScores) {
      const kpiScore = this.kpiScoreRepo.create({
        evaluationId: savedEvaluation.id,
        kpiId: kpiScoreDto.kpiId,
        score: kpiScoreDto.score,
        remarks: kpiScoreDto.remarks,
      });
      await this.kpiScoreRepo.save(kpiScore);
    }

    return savedEvaluation;
  }

  /**
   * Get all evaluations for a specific employee (for employee self-view)
   * param employeeId - employee user ID
   */
  async findEvaluationsByEmployee(
    employeeId: number,
  ): Promise<PerformanceEvaluation[]> {
    return await this.evaluationRepo.find({
      where: { employeeId },
      relations: ['cycle'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all evaluations (for manager) optionally filtered by cycle
   *deparam cycleId - optional cycle ID filter
   */
  async findAllEvaluations(cycleId?: number): Promise<PerformanceEvaluation[]> {
    const where: any = {};
    if (cycleId) where.cycleId = cycleId;
    return await this.evaluationRepo.find({
      where,
      relations: ['cycle', 'employee', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single evaluation by ID with its basic relations
   * param id - evaluation ID
   */
  async findOneEvaluation(id: number): Promise<PerformanceEvaluation> {
    const evaluation = await this.evaluationRepo.findOne({
      where: { id },
      relations: ['cycle', 'employee', 'reviewer'],
    });
    if (!evaluation) throw new NotFoundException('Evaluation not found');
    return evaluation;
  }

  /**
   * Get all KPI scores for a given evaluation
   * param evaluationId - evaluation ID
   */
  async getKpiScores(evaluationId: number): Promise<KpiScore[]> {
    return await this.kpiScoreRepo.find({
      where: { evaluationId },
      relations: ['kpi'],
    });
  }
}

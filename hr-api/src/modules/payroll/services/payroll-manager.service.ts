import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { FilterPayrollDto } from '../dto/filter-payroll.dto';

@Injectable()
export class PayrollManagerService {
  constructor(
    /**
     * Repository responsible for payroll persistence operations.
     * Handles CRUD interactions with the payrolls table.
     */

    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,

    /**
     * Repository used to validate and retrieve user entities.
     * Ensures payroll records are always linked to a valid user.
     */

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Creates a new payroll record for a specific user and salary period.
   *
   * Business Rules:
   * - The user must exist.
   * - Only one payroll record per user per salary period is allowed.
   * - Total amount is calculated as: baseSalary + bonuses - deductions.
   *
   * @param dto CreatePayrollDto containing payroll financial details
   * @returns Persisted Payroll entity
   */

  async create(dto: CreatePayrollDto) {
    /**
     * Validate that the referenced user exists.
     * Prevents orphan payroll records.
     */

    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new BadRequestException('User not found');

    /**
     * Enforce uniqueness: one payroll per user per salary period.
     * Protects financial data integrity and avoids duplicate payments.
     */

    const existing = await this.payrollRepo.findOne({
      where: {
        user: { id: dto.userId },
        salaryPeriod: dto.salaryPeriod,
      },
    });
    if (existing)
      throw new BadRequestException(
        'A pay slip has already been issued for this course',
      );

    /**
     * Normalize optional financial fields.
     * Defaults to 0 if not provided.
     */

    const bonuses = dto.bonuses || 0;
    const deduction = dto.deductions || 0;

    /**
     * Compute final payable amount.
     * This centralizes salary calculation logic in the service layer.
     */

    const totalAmount = dto.baseSalary + bonuses - deduction;

    /**
     * Create payroll entity instance.
     * Notes are optional and stored as null if not provided.
     */

    const payroll = this.payrollRepo.create({
      user,
      salaryPeriod: dto.salaryPeriod,
      baseSalary: dto.baseSalary,
      bonuses,
      deduction,
      totalAmount,
      notes: dto.notes || null,
    });

    /**
     * Create payroll entity instance.
     * Notes are optional and stored as null if not provided.
     */

    return await this.payrollRepo.save(payroll);
  }

  /**
   * Retrieves payroll records based on dynamic filtering criteria.
   *
   * Supports optional filtering by:
   * - userId (admin-level filtering)
   * - salaryPeriod (specific payroll cycle)
   * - status (payment state)
   *
   * Results are ordered by:
   * - salaryPeriod (descending)
   * - creation date (descending)
   *
   * @param filters FilterPayrollDto containing optional query filters
   * @returns Array of Payroll entities with related user data
   */

  async findAll(filters: FilterPayrollDto) {
    /**
     * Initialize query builder for dynamic query construction.
     * Left join ensures related user entity is fetched in the same query.
     */

    const queryBuilder = this.payrollRepo
      .createQueryBuilder('payrolls')
      .leftJoinAndSelect('payrolls.user', 'users');

    /**
     * Apply optional filter: userId
     * Typically used by administrators to retrieve payrolls for a specific employee.
     */

    if (filters.userId) {
      queryBuilder.andWhere('payrolls.userId = :userId', {
        userId: filters.userId,
      });
    }

    /**
     * Apply optional filter: salary period
     * Narrows results to a specific payroll cycle (e.g., 1404/08).
     */

    if (filters.salaryPeriod) {
      queryBuilder.andWhere('payrolls.salaryPeriod = :salaryPeriod', {
        salaryPeriod: filters.salaryPeriod,
      });
    }

    /**
     * Apply optional filter: payroll status
     * Enables filtering by payment state (e.g., pending or paid).
     */

    if (filters.status) {
      queryBuilder.andWhere('payrolls.status = :status', {
        status: filters.status,
      });
    }

    /**
     * Apply sorting strategy:
     * 1. Latest salary period first
     * 2. Within same period, most recently created records first
     *
     * Ensures predictable and business-relevant ordering of payroll data.
     */

    return await queryBuilder
      .orderBy('payrools.salaryPeriod', 'DESC')
      .addOrderBy('payrools.createdAt', 'DESC')
      .getMany();
  }
}

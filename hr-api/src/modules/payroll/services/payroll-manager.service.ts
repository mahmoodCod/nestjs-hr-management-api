/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { FilterPayrollDto } from '../dto/filter-payroll.dto';
import { PayrollStatus } from '../enums/payroll-status.enum';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';

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

    let paymentDate;
    if (dto.status) {
      if (dto.status === PayrollStatus.PAID) paymentDate = new Date();
    }
    const payroll = this.payrollRepo.create({
      user,
      salaryPeriod: dto.salaryPeriod,
      baseSalary: dto.baseSalary,
      bonuses,
      deduction,
      totalAmount,
      paymentDate: paymentDate || null,
      status: dto.status || PayrollStatus.PENDING,
      notes: dto.notes || null,
    });

    /**
     * Create payroll entity instance.
     * Notes are optional and stored as null if not provided.
     */

    return await this.payrollRepo.save(payroll);
  }

  /**
   * Updates an existing payroll record.
   *
   * Behavior:
   * - Validates payroll existence before applying updates.
   * - Supports partial updates for financial and metadata fields.
   * - Automatically recalculates totalAmount after any financial change.
   * - If status changes to PAID, assigns paymentDate (if not already set).
   *
   * Business Rules:
   * - totalAmount = baseSalary + bonuses - deduction
   * - paymentDate is only assigned once when status becomes PAID
   *
   * @param id Unique identifier of the payroll record
   * @param dto Data transfer object containing updated payroll fields
   * @returns Updated and persisted Payroll entity
   * @throws NotFoundException if payroll does not exist
   */

  async update(id: number, dto: UpdatePayrollDto) {
    /**
     * Ensure the payroll record exists.
     * Reuses centralized validation logic from findOne().
     */

    const payroll = await this.findOne(id);

    /**
     * Apply partial updates only if values are provided.
     * Preserves existing values when fields are omitted.
     */

    if (dto.salaryPeriod) payroll.salaryPeriod = dto.salaryPeriod;
    if (dto.baseSalary) payroll.baseSalary = dto.baseSalary;
    if (dto.bonuses) payroll.bonuses = dto.bonuses;
    if (dto.deductions) payroll.deduction = dto.deductions;

    /**
     * Handle status transition logic.
     * When payroll is marked as PAID, automatically assign paymentDate
     * if it has not been previously recorded.
     */

    if (dto.status) {
      payroll.status = dto.status;
      if (dto.status === PayrollStatus.PAID && !payroll.paymentDate) {
        payroll.paymentDate = new Date();
      }
    }

    /**
     * Recalculate total amount to ensure financial consistency.
     * Centralizes salary calculation logic in the service layer.
     */

    payroll.totalAmount =
      payroll.baseSalary + payroll.bonuses - payroll.deduction;

    /**
     * Persist updated entity to the database.
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
      .orderBy('payrolls.salaryPeriod', 'DESC')
      .addOrderBy('payrolls.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Retrieves a single payroll record by its unique identifier.
   *
   * Behavior:
   * - Fetches payroll along with its related user entity.
   * - Throws a NotFoundException if the record does not exist.
   *
   * This method ensures:
   * - Referential data consistency (user relation is always loaded)
   * - Proper HTTP-level error handling for missing resources
   *
   * @param id Unique identifier of the payroll record
   * @returns Payroll entity including related user data
   * @throws NotFoundException if payroll is not found
   */

  async findOne(id: number) {
    /**
     * Attempt to retrieve payroll by primary key.
     * Explicitly loads the related user entity to avoid lazy-loading issues.
     */

    const payroll = await this.payrollRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    /**
     * Guard clause: ensure the payroll exists.
     * Prevents returning null and enforces proper RESTful error semantics.
     */

    if (!payroll) throw new NotFoundException('Payroll not found');

    /**
     * Return the fully populated payroll entity.
     */

    return payroll;
  }

  /**
   * Deletes a payroll record by its unique identifier.
   *
   * Behavior:
   * - Validates payroll existence before attempting deletion.
   * - Reuses findOne() to ensure consistent error handling.
   * - Removes the entity from the database if found.
   *
   * This approach ensures:
   * - No silent failures when deleting non-existent records
   * - Centralized validation logic
   * - Predictable and safe deletion workflow
   *
   * @param id Unique identifier of the payroll record
   * @returns The removed Payroll entity
   * @throws NotFoundException if payroll does not exist
   */

  async remove(id: number) {
    /**
     * Retrieve payroll using existing validation logic.
     * Ensures NotFoundException is thrown if entity does not exist.
     */

    const payroll = await this.findOne(id);

    /**
     * Perform deletion operation using repository remove method.
     * Returns the deleted entity for confirmation purposes.
     */

    return await this.payrollRepo.remove(payroll);
  }
}

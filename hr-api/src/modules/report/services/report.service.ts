import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';
import { LeaveType } from '../../leave/entities/leave-type.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportLog } from '../entities/report.entity';
import { ReportType } from '../enums/report.type.enum';
import * as ExcelJS from 'exceljs';

/**
 * Service responsible for generating Excel reports
 * Uses User entity with fields: id, mobile, role
 */
@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Generate leave report for an employee (self)
   * param userId - employee's user ID
   * param dto - filter options (startDate, endDate, leaveTypeId)
   * returns Excel file buffer
   */
  async generateLeaveReportForEmployee(
    userId: number,
    dto: CreateReportDto,
  ): Promise<Buffer> {
    const where: any = { userId };

    if (dto.startDate && dto.endDate) {
      where.startDate = Between(new Date(dto.startDate), new Date(dto.endDate));
    }
    if (dto.leaveTypeId) {
      where.leaveTypeId = dto.leaveTypeId;
    }

    const leaves = await this.leaveRequestRepo.find({
      where,
      relations: ['leaveType'],
      order: { startDate: 'ASC' },
    });

    return this.buildLeaveExcel(leaves, false);
  }

  /**
   * Generate leave report for a manager (all leave requests)
   * param managerId - manager's user ID (unused, kept for API consistency)
   * param dto - filter options
   * returns Excel file buffer
   */
  async generateLeaveReportForManager(
    managerId: number,
    dto: CreateReportDto,
  ): Promise<Buffer> {
    const where: any = {};

    if (dto.startDate && dto.endDate) {
      where.startDate = Between(new Date(dto.startDate), new Date(dto.endDate));
    }
    if (dto.leaveTypeId) {
      where.leaveTypeId = dto.leaveTypeId;
    }
    // No department filter because User entity has no department field

    const leaves = await this.leaveRequestRepo.find({
      where,
      relations: ['leaveType', 'user'],
      order: { startDate: 'ASC' },
    });

    return this.buildLeaveExcel(leaves, true);
  }

  /**
   * Build Excel file from leave requests (no styling)
   * param leaves - list of leave requests
   * param includeUserInfo - whether to include user mobile column
   * returns Excel buffer
   */
  private async buildLeaveExcel(
    leaves: LeaveRequest[],
    includeUserInfo: boolean = false,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leave Report');

    // Define columns
    const columns: any[] = [
      { header: 'Row', key: 'row', width: 8 },
      { header: 'Leave Type', key: 'leaveType', width: 20 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Duration (days)', key: 'duration', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Reason', key: 'reason', width: 30 },
    ];

    if (includeUserInfo) {
      columns.splice(1, 0, {
        header: 'User Mobile',
        key: 'userMobile',
        width: 15,
      });
    }

    worksheet.columns = columns;

    // Fill rows
    let rowIndex = 1;
    for (const leave of leaves) {
      const row: any = {
        row: rowIndex,
        leaveType: leave.leaveType?.name || 'Unknown',
        startDate: leave.startDate.toLocaleDateString('en-US'),
        endDate: leave.endDate.toLocaleDateString('en-US'),
        duration: leave.durationDays,
        status: leave.status,
        reason: leave.reason || '---',
      };

      if (includeUserInfo) {
        // Use mobile field from User entity as identifier
        row.userMobile = leave.user?.mobile || `User ${leave.userId}`;
      }

      worksheet.addRow(row);
      rowIndex++;
    }

    const buffer = await (workbook.xlsx as any).writeBuffer() as Buffer;
    return buffer as any;
  }
}

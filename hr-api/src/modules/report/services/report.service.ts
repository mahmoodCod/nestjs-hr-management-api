import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';
import { LeaveType } from '../../leave/entities/leave-type.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import * as ExcelJS from 'exceljs';

/**
 * Service responsible for generating Excel reports
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
   * Generates leave report for a single employee (self)
   * @param userId - employee's user ID
   * @param dto - filter options
   * @returns Excel file buffer
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
   * Generates leave report for a manager (all subordinates)
   * @param managerId - manager's user ID
   * @param dto - filter options (including department)
   * @returns Excel file buffer
   */
  async generateLeaveReportForManager(
    managerId: number,
    dto: CreateReportDto,
  ): Promise<Buffer> {
    // Find all users where managerId = current manager
    const subordinates = await this.userRepo.find({ where: { managerId } });
    const userIds = subordinates.map((u) => u.id);

    if (userIds.length === 0) {
      throw new BadRequestException('You have no subordinates.');
    }

    const where: any = { userId: In(userIds) };

    if (dto.startDate && dto.endDate) {
      where.startDate = Between(new Date(dto.startDate), new Date(dto.endDate));
    }
    if (dto.leaveTypeId) {
      where.leaveTypeId = dto.leaveTypeId;
    }
    if (dto.departmentId) {
      const usersInDept = await this.userRepo.find({
        where: { departmentId: dto.departmentId },
      });
      const deptUserIds = usersInDept.map((u) => u.id);
      where.userId = In(deptUserIds.filter((id) => userIds.includes(id)));
    }

    const leaves = await this.leaveRequestRepo.find({
      where,
      relations: ['leaveType', 'user'],
      order: { startDate: 'ASC' },
    });

    return this.buildLeaveExcel(leaves, true);
  }

  /**
   * Builds an Excel workbook from leave requests (no styling)
   * @param leaves - list of leave requests
   * @param includeUserInfo - whether to add a user name column
   * @returns Excel file buffer
   */
  private async buildLeaveExcel(
    leaves: LeaveRequest[],
    includeUserInfo: boolean = false,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leave Report');

    // Define columns (only width, no styling)
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
      columns.splice(1, 0, { header: 'User Name', key: 'userName', width: 20 });
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
        // Adjust field name according to your User entity (e.g., 'name', 'fullName', 'email')
        row.userName =
          leave.user?.name || leave.user?.email || leave.userId.toString();
      }

      worksheet.addRow(row);
      rowIndex++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

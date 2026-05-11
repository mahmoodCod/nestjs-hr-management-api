import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateReportDto } from '../dto/update-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveRequest } from 'src/modules/leave/entities/leave-request.entity';
import { Between, In, Repository } from 'typeorm';
import { LeaveType } from 'src/modules/leave/entities/leave-type.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import * as ExcelJS from 'exceljs';

/**
 * Service responsible for generating reports (Excel files)
 * Uses data from Leave, Attendance, and User modules
 */
@Injectable()
export class ReportService {
  buildLeaveExcel: any;
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Generate leave report for a single employee (self)
   * param userId - Employee's user ID
   * param dto - Filter options (dates, leave type)
   * returns Excel file buffer
   */
  async generateLeaveReportForEmployee(
    userId: number,
    createReportDto: CreateReportDto,
  ): Promise<Buffer> {
    // Build query conditions
    const where: any = { userId };
    if (createReportDto.startDate && createReportDto.endDate) {
      where.startDate = Between(
        new Date(createReportDto.startDate),
        new Date(createReportDto.endDate),
      );
    }
    if (createReportDto.leaveTypeId) {
      where.leaveTypeId = createReportDto.leaveTypeId;
    }
    const leaves = await this.leaveRequestRepo.find({
      where,
      relations: ['leaveType'],
      order: { startDate: 'ASC' },
    });
    return this.buildLeaveExcel(leaves, false);
  }

  /**
   * Generate leave report for a manager (all subordinates, optional department filter)
   * param managerId - Manager's user ID
   * param dto - Filter options (dates, leave type, department)
   * returns Excel file buffer
   */
  async generateLeaveReportForManager(
    managerId: number,
    createReportDto: CreateReportDto,
  ) {
    // Find subordinates (users whose managerId equals managerId)
    const subordinates = await this.userRepo.find({ where: { id: managerId } });
    const userIds = subordinates.map((u) => u.id);
    if (userIds.length === 0) {
      throw new BadRequestException('You have no subordinates.');
    }

    const where: any = { userId: In(userIds) };

    if (createReportDto.startDate && createReportDto.endDate) {
      where.startDate = Between(
        new Date(createReportDto.startDate),
        new Date(createReportDto.endDate),
      );
    }
    if (createReportDto.leaveTypeId) {
      where.leaveTypeId = createReportDto.leaveTypeId;
    }
    // Optional department filter
    if (createReportDto.departmentId) {
      const usersInDept = await this.userRepo.find({
        where: { id: createReportDto.departmentId },
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
   * Build an Excel workbook from leave requests
   * param leaves - Array of leave requests
   * param includeUserInfo - Whether to include user name column (for manager reports)
   * returns Excel file buffer
   */
  private async buildLeaveExcel(
    leaves: LeaveRequest[],
    includeUserInfo: boolean = false,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.workbook();
    const worksheet = workbook.addWorksheet('Leave Report');
  }
  findAll() {
    return `This action returns all report`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}

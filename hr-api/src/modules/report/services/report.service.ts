import { Injectable } from '@nestjs/common';
import { UpdateReportDto } from '../dto/update-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveRequest } from 'src/modules/leave/entities/leave-request.entity';
import { Between, Repository } from 'typeorm';
import { LeaveType } from 'src/modules/leave/entities/leave-type.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';

/**
 * Service responsible for generating reports (Excel files)
 * Uses data from Leave, Attendance, and User modules
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
        new Date(CreateReportDto.startDate),
        new Date(CreateReportDto.endDate),
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

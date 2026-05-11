import { Injectable } from '@nestjs/common';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveRequest } from 'src/modules/leave/entities/leave-request.entity';
import { Repository } from 'typeorm';
import { LeaveType } from 'src/modules/leave/entities/leave-type.entity';
import { User } from 'src/modules/auth/entities/user.entity';

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
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
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

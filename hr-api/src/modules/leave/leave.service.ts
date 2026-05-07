import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave.request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave.request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { Repository } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
  ) {}
  // craete new leave request
  async create(userId: number, createLeaveRequestDto: CreateLeaveRequestDto) {
    // Checking the type of leave
    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id: createLeaveRequestDto.leaveTypeId },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const startDate = new Date(createLeaveRequestDto.startDate);
    const endDate = new Date(createLeaveRequestDto.endDate);
    
  }

  findAll() {
    return `This action returns all leave`;
  }

  findOne(id: number) {
    return `This action returns a #${id} leave`;
  }

  update(id: number, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    return `This action updates a #${id} leave`;
  }

  remove(id: number) {
    return `This action removes a #${id} leave`;
  }
}

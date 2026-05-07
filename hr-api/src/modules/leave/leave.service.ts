import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave.request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave.request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { Between, In, Repository } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveRequestStatusEnum } from 'src/shared/enums/leave-request.enum';

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

    if (startDate > endDate)
      throw new BadRequestException(
        'The start date cannot be greater than the end date',
      );
    if (startDate < new Date()) {
      throw new BadRequestException('the start date cannot be in the past');
    }

    // Calculate the number of days (including both days)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationdays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Checking the interference with previous requests (Pending or Approved)
    const overLapping = await this.leaveRequestRepo.findOne({
      where: {
        userId,
        status: In([
          LeaveRequestStatusEnum.PENDING,
          LeaveRequestStatusEnum.APPROVED,
        ]),
        startDate: Between(startDate, endDate),
      },
    });
    if (overLapping)
      throw new BadRequestException(
        'Leave request conflicts with another request',
      );
  }

  // A list of requests from a specific user
  async findAllForUser(userId: number) {
    return await this.leaveRequestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['LeaveType'], // To display the name of the leave type
    });
  }

  // List of requests from all users
  async findAllForManager() {
    return await this.leaveRequestRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['LeaveType', 'user'], // Information of the requesting user
    });
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

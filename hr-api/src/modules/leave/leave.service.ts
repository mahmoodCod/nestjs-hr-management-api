import {
  BadRequestException,
  ForbiddenException,
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
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

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

    // بررسی موجودی سالانه – در صورت نیاز می‌توانی پیاده‌سازی کنی
    const newRequest = this.leaveRequestRepo.create({
      userId,
      leaveTypeId: createLeaveRequestDto.leaveTypeId,
      startDate,
      endDate,
      durationDays,
      reason: createLeaveRequestDto.reason,
      status: LeaveRequestStatusEnum.PENDING,
    });

    return await this.leaveRequestRepo.save(newRequest);
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

  async findOne(id: number) {
    const request = await this.leaveRequestRepo.findOne({
      where: { id },
      relations: ['LeaveType', 'user'],
    });

    if (!request) throw new NotFoundException('Leave request not found');

    return request;
  }

  // Update the status of the request (approved/rejected) by the administrator
  async updateStatus(
    id: number,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
    approverId: number,
  ) {
    const request = await this.findOne(id);
    if (request.status !== LeaveRequestStatusEnum.PENDING) {
      throw new BadRequestException(
        'Only requests in "pending" status can be changed.',
      );
    }
    request.status = updateLeaveRequestDto.status;
    request.approvedBy = approverId;
    request.approvedAt = new Date();
    return await this.leaveRequestRepo.save(request);
  }

  // Canceling the request by the employee herself (only in pending status)
  async cancelRequest(id: number, userId: number) {
    const request = await this.findOne(id);
    if (request.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this request.',
      );
    }
    if (request.status !== LeaveRequestStatusEnum.PENDING) {
      throw new BadRequestException('Only pending requests can be canceled');
    }
    request.status = LeaveRequestStatusEnum.CANCELLED;
    return await this.leaveRequestRepo.save(request);
  }

  // Calculation of the user's leave balance in a given year
  async getBalance(userId: number, year: number) {
    const leaveTypes = await this.leaveTypeRepo.find();
    const balances: {
      leaveTypeId: number;
      name: string;
      daysPerYear: number;
      usedDays: number;
      remaining: number | null;
      isUnlimited: boolean;
    }[] = [];

    // Construction of the beginning and end of the year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    for (const type of leaveTypes) {
      // Calculation of the total number of days used this year for this type of leave (only APPROVED)
      const usedDays =
        (await this.leaveRequestRepo.sum('durationDays', {
          userId,
          leaveTypeId: type.id,
          status: LeaveRequestStatusEnum.APPROVED,
          startDate: Between(startOfYear, endOfYear),
        })) || 0;

      const remaining =
        type.daysPerYear === 0 ? null : type.daysPerYear - usedDays;

      balances.push({
        leaveTypeId: type.id,
        name: type.name,
        daysPerYear: type.daysPerYear,
        usedDays,
        remaining: remaining !== null ? Math.max(0, remaining) : null,
        isUnlimited: type.daysPerYear === 0,
      });
    }
    return balances;
  }
  async remove(id: number) {
    const request = await this.findOne(id);
    return await this.leaveRequestRepo.remove(request);
  }
}

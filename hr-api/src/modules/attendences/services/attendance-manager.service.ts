// src/modules/attendance/services/attendance-manager.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';

@Injectable()
export class AttendanceManagerService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
  ) {}

  async findAll(filters: FilterAttendanceDto) {
    const qb = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .orderBy('attendance.checkInTime', 'DESC');

    if (filters.startTime) {
      qb.andWhere('attendance.checkInTime >= :startTime', {
        startTime: filters.startTime,
      });
    }
    if (filters.endTime) {
      qb.andWhere('attendance.checkOutTime <= :endTime', {
        endTime: filters.endTime,
      });
    }

    return qb.getMany();
  }
}

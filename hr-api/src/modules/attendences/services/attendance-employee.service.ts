/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { IsNull, Repository } from 'typeorm';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';

@Injectable()
export class AttendanceEmployeeService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRep: Repository<Attendance>,
  ) {}

  async checkIn(userId: number, notes?: string) {
    const opened_attendance = await this.attendanceRep.find({
      where: {
        user: { id: userId },
        checkOutTime: IsNull(),
      },
    });

    if (opened_attendance.length)
      throw new BadRequestException(
        'You have a traffic block that has not registered its exit yet',
      );
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const attendance = await this.attendanceRep.create({
      user: { id: userId } as any,
      checkInTime: new Date(),
      notes: notes || null,
    });

    return await this.attendanceRep.save(attendance);
  }

  async checkOut(userId: number, notes?: string) {
    const attendance = await this.attendanceRep.findOne({
      where: {
        user: { id: userId },
        checkOutTime: IsNull(),
      },
      order: { checkInTime: 'DESC' },
    });

    if (!attendance)
      throw new NotFoundException('No input records found with no output');

    attendance.checkOutTime = new Date();

    if (notes) {
      attendance.notes = attendance.notes
        ? `${attendance.notes} - ${notes}`
        : notes;
    }

    return await this.attendanceRep.save(attendance);
  }

  // Retrieves the authenticated user's attendance records optionally filtered by start and end times, ordered by latest check-in
  async findMyAttendance(userId: number, filters: FilterAttendanceDto) {
    const queryBuilder = this.attendanceRep
      .createQueryBuilder('attendance')
      .where('attendance.user.id = :userId', { userId });

    if (filters.startTime) {
      queryBuilder.andWhere('attendance.checkInTime >= :startTime', {
        startTime: filters.startTime,
      });
    }

    if (filters.endTime) {
      queryBuilder.andWhere('attendance.checkOutTime <= :endTime', {
        endTime: filters.endTime,
      });
    }

    return await queryBuilder
      .orderBy('attendance.checkInTime', 'DESC')
      .getMany();
  }
}

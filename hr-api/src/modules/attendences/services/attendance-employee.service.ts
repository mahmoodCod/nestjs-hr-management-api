/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class AttendanceEmployeeService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRep: Repository<Attendance>,
  ) {}

  async checkIn(userId: number, notes?: string) {
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
}

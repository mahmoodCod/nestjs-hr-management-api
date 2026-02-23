/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Repository } from 'typeorm';

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
}

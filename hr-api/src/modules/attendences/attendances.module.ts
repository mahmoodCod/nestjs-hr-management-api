import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { User } from 'src/common/decorators/user.decorator';
import { AttendanceEmployeeService } from './services/attendance-employee.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User])],

  controllers: [],

  providers: [AttendanceEmployeeService],
})
export class AttendanceModule {}

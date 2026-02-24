import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { User } from 'src/common/decorators/user.decorator';
import { AttendanceEmployeeService } from './services/attendance-employee.service';
import { AttendanceEmployeeController } from './controllers/attendance-employee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User])],

  controllers: [AttendanceEmployeeController],

  providers: [AttendanceEmployeeService],
})
export class AttendanceModule {}

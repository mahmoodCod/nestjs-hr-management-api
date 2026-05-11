import { Module } from '@nestjs/common';
import { ReportService } from './services/report.service';
import { EmployeeReportController } from './controllers/employee.report.controller';
import { ManagerReportController } from './controllers/manager.report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from '../leave/entities/leave-request.entity';
import { LeaveType } from '../leave/entities/leave-type.entity';
import { User } from '../auth/entities/user.entity';

/**
 * Report module – provides Excel export functionality for leave reports.
 * No new entity needed; reads data from Leave and User modules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveType, User])],
  controllers: [EmployeeReportController, ManagerReportController],
  providers: [ReportService],
})
export class ReportModule {}

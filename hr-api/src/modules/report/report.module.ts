import { Module } from '@nestjs/common';
import { ReportService } from './services/report.service';
import { EmployeeReportController } from './controllers/employee.report.controller';
import { ManagerReportController } from './controllers/manager.report.controller';

@Module({
  controllers: [EmployeeReportController, ManagerReportController],
  providers: [ReportService],
})
export class ReportModule {}

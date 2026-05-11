import { Controller } from '@nestjs/common';
import { ReportService } from '../services/report.service';

@Controller('employee/report')
export class EmployeeReportController {
  constructor(private readonly reportService: ReportService) {}
}

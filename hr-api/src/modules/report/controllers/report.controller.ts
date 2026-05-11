import { Controller } from '@nestjs/common';
import { ReportService } from '../services/report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
}

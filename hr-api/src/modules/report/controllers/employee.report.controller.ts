import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateReportDto } from '../dto/create-report.dto';
import { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Employee Report Controller
 * All routes require JWT authentication.
 * Base path: /employee/report
 */
@ApiBearerAuth()
@Controller('employee/report')
@UseGuards(JwtAurhGuard)
export class EmployeeReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Export leave report for the currently authenticated employee.
   * Query parameters (all optional):
   * - startDate: YYYY-MM-DD
   * - endDate: YYYY-MM-DD
   * - leaveTypeId: number
   * Returns an Excel file as attachment.
   */
  @Get('leave')
  async getLeaveReport(
    @Req() req,
    @Query() dto: CreateReportDto,
    @Res() res: Response,
  ) {
    // Extract user ID from JWT payload
    const userId = req.user.id;

    // Generate Excel buffer
    const buffer = await this.reportService.generateLeaveReportForEmployee(
      userId,
      dto,
    );

    // Set response headers for file download
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="leave_report.xlsx"',
    });

    res.send(buffer);
  }
}

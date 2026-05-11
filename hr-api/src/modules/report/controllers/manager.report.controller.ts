import { Controller, Get, Query, Req, UseGuards, Res } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { JwtAurhGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../shared/enums/user-role.enum';
import { Response } from 'express';

/**
 * Manager Report Controller
 * All routes require JWT authentication and MANAGER role.
 * Base path: /manager/report
 */
@Controller('manager/report')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Export leave report for all employees (or filtered).
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
    // Extract manager ID from JWT payload
    const managerId = req.user.id;

    // Generate Excel buffer
    const buffer = await this.reportService.generateLeaveReportForManager(
      managerId,
      dto,
    );

    // Set response headers for file download
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="team_leave_report.xlsx"',
    });

    res.send(buffer);
  }
}

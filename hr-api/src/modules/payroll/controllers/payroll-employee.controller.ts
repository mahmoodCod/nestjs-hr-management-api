import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../../modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { Role } from '../../../shared/enums/user-role.enum';
import { PayrollManagerService } from '../services/payroll-manager.service';
import { ApiBearerAuth } from '@nestjs/swagger';

// employee/payroll.controller.ts
@ApiBearerAuth()
@Controller('employee/payroll')
@UseGuards(JwtAurhGuard)
@Roles(Role.EMPLOYEE)
export class PayrollEmployeeController {
  constructor(private payrollService: PayrollManagerService) {}

  @Get()
  async getMyPayrolls(@Req() req) {
    const userId = req.user.id;
    return await this.payrollService.findAll({ userId });
  }
}

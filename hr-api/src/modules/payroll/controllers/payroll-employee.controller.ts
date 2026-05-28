import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { PayrollManagerService } from '../services/payroll-manager.service';

// employee/payroll.controller.ts
@Controller('employee/payroll')
@UseGuards(JwtAurhGuard)
@Roles(Role.EMPLOYEE)
export class PayrollEmployeeController {
  constructor(private payrollService: PayrollManagerService) {}

  @Get()
  async getMyPayrolls(@Req() req) {
    const userId = req.user.id;
    return this.payrollService.findAll({ userId });
  }
}

import { Controller, UseGuards } from '@nestjs/common';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { LeaveService } from '../services/leave.service';

@Controller('employee_leave')
@UseGuards(JwtAurhGuard)
export class ManagerLeaveController {
  constructor(private readonly leaveService: LeaveService) {}
}

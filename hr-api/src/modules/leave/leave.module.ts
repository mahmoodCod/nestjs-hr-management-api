import { Module } from '@nestjs/common';
import { LeaveService } from './services/leave.service';
import { EmployeeLeaveController } from './controllers/employee.leave.controller';

@Module({
  controllers: [EmployeeLeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}

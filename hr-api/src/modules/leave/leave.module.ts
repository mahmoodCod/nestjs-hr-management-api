import { Module } from '@nestjs/common';
import { LeaveService } from './services/leave.service';
import { EmployeeLeaveController } from './controllers/employee.leave.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveType } from './entities/leave-type.entity';
import { ManagerLeaveController } from './controllers/manager.leave.controller';
import { ManagerLeaveTypeController } from './controllers/manager.leave.type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveType])],
  controllers: [
    EmployeeLeaveController,
    ManagerLeaveController,
    ManagerLeaveTypeController,
  ],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}

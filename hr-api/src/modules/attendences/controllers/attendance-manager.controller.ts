// src/modules/attendance/controllers/attendance-manager.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../shared/enums/user-role.enum';
import { JwtAurhGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AttendanceManagerService } from '../services/attendance-manager.service';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';

@ApiBearerAuth()
@Controller('manager/attendance')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class AttendanceManagerController {
  constructor(
    private readonly attendanceManagerService: AttendanceManagerService,
  ) {}

  @Get()
  async findAll(@Query() filters: FilterAttendanceDto) {
    return this.attendanceManagerService.findAll(filters);
  }
}

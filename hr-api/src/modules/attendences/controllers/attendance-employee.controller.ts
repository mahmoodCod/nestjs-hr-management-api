import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/shared/enums/user-role.enum';
import { AttendanceEmployeeService } from '../services/attendance-employee.service';
import { CheckInOutDto } from '../dto/check-in-out.dto';
import { User } from 'src/common/decorators/user.decorator';

@ApiBearerAuth()
@Roles(Role.EMPLOYEE)
@Controller('employee/attendance')
export class AttendanceEmployeeController {
  constructor(private readonly attendanceService: AttendanceEmployeeService) {}

  @Post('check-in')
  async checkIn(
    @Body() dto: CheckInOutDto,
    @User() user: { id: number; role: string },
  ) {
    return await this.attendanceService.checkIn(user.id, dto.notes);
  }

  @Post('check-out')
  async checkOut(
    @Body() dto: CheckInOutDto,
    @User() user: { id: number; role: string },
  ) {
    return await this.attendanceService.checkOut(user.id, dto.notes);
  }
}

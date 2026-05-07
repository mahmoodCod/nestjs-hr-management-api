import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { CreateLeaveRequestDto } from '../dto/create-leave.request.dto';
import { JwtAurhGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/shared/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('employee/leave')
@Roles(Role.EMPLOYEE)
@UseGuards(JwtAurhGuard)
export class EmployeeLeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('request')
  create(@Req() req, @Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    const userId = req.user.userId;
    return this.leaveService.create(userId, createLeaveRequestDto);
  }

  @Get('requests')
  findAllForUser(@Req() req) {
    const userId = req.user.userId;
    return this.leaveService.findAllForUser(userId);
  }

  @Get('balance')
  getBalance(@Req() req, @Query('year') year: number) {
    const userId = req.user.userId;
    const targetYear = year || new Date().getFullYear();
    return this.leaveService.getBalance(userId, targetYear);
  }

  @Delete(':id/cancel')
  cancel(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.leaveService.cancelRequest(+id, userId);
  }
}

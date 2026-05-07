import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { CreateLeaveRequestDto } from '../dto/create-leave.request.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave.request.dto';
import { JwtAurhGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('employee_leave')
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}

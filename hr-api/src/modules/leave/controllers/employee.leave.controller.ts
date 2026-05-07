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
  create(@Req() @Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    const userId = Req.user.userId;
    return this.leaveService.create(userId, createLeaveRequestDto);
  }

  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    return this.leaveService.update(+id, updateLeaveRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { CreateLeaveTypeDto } from '../dto/create-leave.type.dto';
import { UpdateLeaveTypeDto } from '../dto/update-leave.type.dto';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('manager/leave-types')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerLeaveTypeController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(dto);
  }

  @Get()
  findAll() {
    return this.leaveService.findAllLeaveTypes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOneLeaveType(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.leaveService.updateLeaveType(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.deleteLeaveType(+id);
  }
}

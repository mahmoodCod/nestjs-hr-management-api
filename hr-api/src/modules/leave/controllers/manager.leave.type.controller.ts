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
import { JwtAurhGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../modules/auth/guards/roles.guard';
import { Role } from '../../../shared/enums/user-role.enum';
import { Roles } from '../../../modules/auth/decorators/roles.decorator';
import { JwtAurhGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../../shared/enums/user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
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

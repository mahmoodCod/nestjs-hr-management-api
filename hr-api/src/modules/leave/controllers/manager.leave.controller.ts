import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAurhGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../modules/auth/guards/roles.guard';
import { Roles } from '../../../modules/auth/decorators/roles.decorator';
import { LeaveService } from '../services/leave.service';
import { Role } from '../../../shared/enums/user-role.enum';
import { UpdateLeaveRequestDto } from '../dto/update-leave.request.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('manager/leave')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerLeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('requests')
  findAllForManager(@Req() req, @Query() query) {
    // You can get additional filters such as status from the query
    return this.leaveService.findAllForManager();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Req() req,
  ) {
    const approverId = req.user.userId;
    return this.leaveService.updateStatus(
      +id,
      updateLeaveRequestDto,
      approverId,
    );
  }
}

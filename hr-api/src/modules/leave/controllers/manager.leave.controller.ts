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
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { LeaveService } from '../services/leave.service';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/shared/enums/user-role.enum';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UpdateLeaveRequestDto } from '../dto/update-leave.request.dto';

@Controller('manager_leave')
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

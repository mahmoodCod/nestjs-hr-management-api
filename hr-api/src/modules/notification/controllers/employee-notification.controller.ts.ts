import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Patch,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/shared/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Employee Notification Controller
 * All routes are prefixed with /employee/notifications and protected by JWT.
 */
@ApiBearerAuth()
@Controller('employee/notifications')
@UseGuards(JwtAurhGuard)
@Roles(Role.EMPLOYEE)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get all notifications for the currently authenticated employee.
   * Query param ?unread=true returns only unread notifications.
   */
  @Get()
  async findAll(@Req() req, @Query('unread') unread?: string) {
    // Extract userId from the JWT payload (adjust field name if needed)
    const userId = req.user.id;
    const unreadOnly = unread === 'true';
    return this.notificationService.findAllForUser(userId, unreadOnly);
  }

  /**
   * Mark a single notification as read.
   * param id - notification ID
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.markAsRead(+id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, userId: number) {
    return this.notificationService.remove(+id, userId);
  }
}

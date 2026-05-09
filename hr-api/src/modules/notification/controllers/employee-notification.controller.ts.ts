import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';

/**
 * Employee Notification Controller
 * All routes are prefixed with /employee/notifications and protected by JWT.
 */
@Controller('employee/notifications')
@UseGuards(JwtAurhGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAllForUser(userId: number) {
    return this.notificationService.findAllForUser(userId);
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

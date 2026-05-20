import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../../modules/auth/decorators/roles.decorator';
import { RolesGuard } from '../../../modules/auth/guards/roles.guard';
import { NotificationService } from '../services/notification.service';
import { JwtAurhGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { Role } from '../../../shared/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Manager Notification Controller
 * Allows managers to view all notifications across the system.
 */
@ApiBearerAuth()
@Controller('manager/notifications')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get all notifications from all users (system‑wide).
   * Note: You may need to add a dedicated method in the service.
   */
  @Get()
  async findAll() {
    // Option 1: call a new service method like findAllForAllUsers()
    // Option 2: directly use the repository
    return this.notificationService.findAllForAllUsers();
  }
}

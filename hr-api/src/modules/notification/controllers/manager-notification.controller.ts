import { Controller, UseGuards } from '@nestjs/common';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { NotificationService } from '../services/notification.service';
import { JwtAurhGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/shared/enums/user-role.enum';

/**
 * Manager Notification Controller
 * Allows managers to view all notifications across the system.
 */
@Controller('manager/notifications')
@UseGuards(JwtAurhGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerNotificationController {
  constructor(private readonly notificationService: NotificationService) {}
}

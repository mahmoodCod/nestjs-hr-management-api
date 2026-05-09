import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { ManagerNotificationController } from './controllers/manager-notification.controller';
import { EmployeeNotificationController } from './controllers/employee-notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [EmployeeNotificationController, ManagerNotificationController], // include as needed
  providers: [NotificationService],
  exports: [NotificationService], // so other modules (e.g., LeaveModule) can use it
})
export class NotificationModule {}

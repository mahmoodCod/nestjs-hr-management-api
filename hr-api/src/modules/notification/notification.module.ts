import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [], // include as needed
  providers: [NotificationService],
  exports: [NotificationService], // so other modules (e.g., LeaveModule) can use it
})
export class NotificationModule {}

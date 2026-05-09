import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

/**
 * Notification management service
 * Task: Create, search, mark as read, and delete notifications
 */
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Create a new notification
   * param dto - notification data (userId, title, message, type, etc.)
   * returns saved notification entity
   */
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(createNotificationDto);
    return await this.notificationRepo.save(notification);
  }

  /**
   * Get all notifications for a specific user
   * param userId - user ID
   * param unreadOnly - if true, returns only unread notifications
   * returns array of notifications sorted by newest first
   */
  async findAll(userId: number, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return await this.notificationRepo.find({
      where: where as FindOptionsWhere<Notification>,
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}

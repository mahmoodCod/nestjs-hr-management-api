import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../enums/notification.type.enum';

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
  async findAllForUser(userId: number, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return await this.notificationRepo.find({
      where: where as FindOptionsWhere<Notification>,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a single notification by ID
   * param id - notification ID
   * returns notification entity
   * throws NotFoundException if notification does not exist
   */
  async findOne(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });

    if (!notification) throw new NotFoundException('Notification not found');

    return notification;
  }

  /**
   * Mark a specific notification as read (only if it belongs to the user)
   * param id - notification ID
   * param userId - user ID for ownership check
   * returns updated notification
   */
  async markAsRead(id: number, userId: number) {
    const notification = await this.findOne(id);
    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found for this user');
    }
    notification.isRead = true;
    return await this.notificationRepo.save(notification);
  }

  /**
   * Mark all unread notifications of a user as read
   * param userId - user ID
   */
  async markAllAsRead(userId: number) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'All notifications marked as read' };
  }

  /**
   * Delete a notification (only if it belongs to the user)
   * param id - notification ID
   * param userId - user ID for ownership check
   */
  async remove(id: number, userId: number) {
    const notification = await this.findOne(id);
    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found for this user');
    }
    return await this.notificationRepo.remove(notification);
  }

  /**
   * Get all notifications from all users (admin only)
   */
  async findAllForAllUsers() {
    return await this.notificationRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
  /**
   * Helper method to create a leave‑related notification
   * param userId - recipient user ID
   * param title - notification title
   * param message - notification message
   * param type - notification type (from NotificationType enum)
   * param relatedEntityId - optional leave request ID
   */
  async createLeaveNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    relatedEntityId?: number,
  ) {
    return this.create({
      userId,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType: 'leave_request',
    });
  }
}

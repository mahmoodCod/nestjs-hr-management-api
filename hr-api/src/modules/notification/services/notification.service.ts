import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * ایجاد یک اعلان جدید
   * @param dto - داده‌های اعلان (userId, title, message, type و ...)
   * @returns اعلان ذخیره شده
   */
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(createNotificationDto);
    return await this.notificationRepo.save(notification);
  }

  findAll() {
    return `This action returns all notification`;
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

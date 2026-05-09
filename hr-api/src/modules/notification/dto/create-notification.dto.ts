import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../enums/notification.type.enum';

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Leave request approved' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Your vacation request has been successfully approved.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.LEAVE_APPROVED,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  relatedEntityId?: number;

  @ApiPropertyOptional({ example: 'leave_request' })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;
}

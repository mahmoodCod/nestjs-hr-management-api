import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLeaveRequestDto } from './create-leave.request.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { LeaveRequestStatusEnum } from 'src/modules/leave/enums/leave-request.enum';

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {
  @ApiProperty({
    enum: LeaveRequestStatusEnum,
    example: LeaveRequestStatusEnum.APPROVED,
    description: 'وضعیت جدید (approved یا rejected)',
  })
  @IsEnum(LeaveRequestStatusEnum)
  status: LeaveRequestStatusEnum;

  @ApiPropertyOptional({
    example: 5,
    description:
      'شناسه کاربر تأییدکننده (در صورت نیاز، معمولاً از توکن گرفته می‌شود)',
  })
  @IsOptional()
  @IsInt()
  approvedBy?: number;
}

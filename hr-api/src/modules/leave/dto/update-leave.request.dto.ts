import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLeaveRequestDto } from './create-leave.request.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { LeaveRequestStatusEnum } from '../../leave/enums/leave-request.enum';

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {
  @ApiProperty({
    enum: LeaveRequestStatusEnum,
    example: LeaveRequestStatusEnum.APPROVED,
    description: 'new status (approved or rejected)',
  })
  @IsEnum(LeaveRequestStatusEnum)
  status: LeaveRequestStatusEnum;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Authenticating user ID (if needed, usually taken from the token)',
  })
  @IsOptional()
  @IsInt()
  approvedBy?: number;
}

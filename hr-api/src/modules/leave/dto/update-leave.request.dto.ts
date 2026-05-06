import { PartialType } from '@nestjs/swagger';
import { CreateLeaveRequestDto } from './create-leave.request.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { LeaveRequestStatusEnum } from 'src/shared/enums/leave-request.enum';

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {
  @IsEnum(LeaveRequestStatusEnum)
  status: LeaveRequestStatusEnum;

  @IsOptional()
  @IsInt()
  approvedBy?: number;
}

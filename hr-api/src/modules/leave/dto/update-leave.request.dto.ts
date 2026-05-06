import { PartialType } from '@nestjs/swagger';
import { CreateLeaveRequestDto } from './create-leave.request.dto';

export class UpdateLeaveDto extends PartialType(CreateLeaveRequestDto) {}

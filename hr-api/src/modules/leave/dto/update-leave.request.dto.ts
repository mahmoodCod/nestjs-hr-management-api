import { PartialType } from '@nestjs/swagger';
import { CreateLeaveDto } from './create-leave.request.dto';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {}

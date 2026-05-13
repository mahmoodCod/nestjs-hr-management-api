import { PartialType } from '@nestjs/swagger';
import { CreateRecruitmentDto } from './create-job-post.dto';

export class UpdateRecruitmentDto extends PartialType(CreateRecruitmentDto) {}

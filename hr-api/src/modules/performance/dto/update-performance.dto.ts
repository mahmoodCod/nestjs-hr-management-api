import { PartialType } from '@nestjs/swagger';
import { CreatePerformanceCycleDto } from './create-performance-cycle.dto';

export class UpdatePerformanceDto extends PartialType(
  CreatePerformanceCycleDto,
) {}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * DTO for creating a KPI within a performance cycle
 */
export class CreateKpiDto {
  @ApiProperty({
    example: 'Task Completion Rate',
    description: 'Title of the KPI',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Percentage of tasks completed on time',
    description: 'Detailed description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 0.4,
    description: 'Weight (0-1). Sum across all KPIs in a cycle must equal 1',
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum possible score for this KPI',
  })
  @IsNumber()
  @Min(1)
  maxScore: number;
}

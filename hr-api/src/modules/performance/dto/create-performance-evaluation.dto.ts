import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * DTO for each KPI score inside an evaluation
 */
class PerformanceKpiScoreDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  kpiId: number;

  @ApiProperty({ example: 85 })
  @IsInt()
  score: number;

  @ApiPropertyOptional({ example: 'Good performance' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

/**
 * DTO for creating a performance evaluation
 */
export class CreateEvaluationDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the employee being evaluated',
  })
  @IsInt()
  employeeId: number;

  @ApiProperty({ example: 1, description: 'ID of the performance cycle' })
  @IsInt()
  cycleId: number;

  @ApiProperty({
    type: [PerformanceKpiScoreDto],
    description: 'List of KPI scores',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceKpiScoreDto)
  kpiScores: PerformanceKpiScoreDto[];

  @ApiPropertyOptional({ example: 'Overall comments...' })
  @IsString()
  @IsOptional()
  comments?: string;
}

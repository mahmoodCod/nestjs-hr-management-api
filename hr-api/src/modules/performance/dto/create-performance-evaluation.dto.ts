import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

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

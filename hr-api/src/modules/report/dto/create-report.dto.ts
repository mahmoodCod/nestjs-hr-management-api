import { IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'start date(YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'start end(YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Leave type ID' })
  @IsInt()
  @IsOptional()
  leaveTypeId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Department ID (administrator only – optional)',
  })
  @IsInt()
  @IsOptional()
  departmentId?: number;
}

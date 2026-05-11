import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

/**
 * DTO for creating a new performance cycle
 */
export class CreatePerformanceCycleDto {
  @ApiProperty({
    example: 'Q1 2026 Performance',
    description: 'Name of the performance cycle',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-31', description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;
}

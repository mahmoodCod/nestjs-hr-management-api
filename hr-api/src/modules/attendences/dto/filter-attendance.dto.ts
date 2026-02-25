import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

// To filter presence absence
export class FilterAttendanceDto {
  // start time
  @ApiPropertyOptional({
    example: '2026-02-24T07:37:43.210Z',
    description: 'start time',
  })
  @IsDateString({}, { message: 'The start time format is not correct' })
  @IsOptional()
  startTime?: string;

  // start end
  @ApiPropertyOptional({
    example: '2026-02-24T07:37:43.210Z',
    description: 'end time',
  })
  @IsDateString({}, { message: 'The end time format is not correct' })
  @IsOptional()
  endTime?: string;
}

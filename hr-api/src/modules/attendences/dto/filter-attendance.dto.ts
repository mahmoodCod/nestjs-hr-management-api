import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

// To filter presence absence
export class FilterAttendanceDto {
  // start time
  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'start time',
  })
  @IsDateString({}, { message: 'The start time format is not correct' })
  @IsOptional()
  startTime?: string;

  // start end
  @ApiPropertyOptional({
    example: '2024-01-31T00:5959.999Z',
    description: 'start end',
  })
  @IsDateString({}, { message: 'The end time format is not correct' })
  @IsOptional()
  endTime?: string;
}

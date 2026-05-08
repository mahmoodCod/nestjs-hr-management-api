import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the leave type (from the leave_types table)',
  })
  @IsInt()
  @IsNotEmpty()
  leaveTypeId: number;

  @ApiProperty({
    example: '2026-05-10',
    description: 'Leave start date (YYYY-MM-DD format)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2026-05-15',
    description: 'Leave end date (YYYY-MM-DD format)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    example: 'business trip',
    description: 'Optional description for leave request',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

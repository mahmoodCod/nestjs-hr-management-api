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
    description: 'شناسه نوع مرخصی (از جدول leave_types)',
  })
  @IsInt()
  @IsNotEmpty()
  leaveTypeId: number;

  @ApiProperty({
    example: '2026-05-10',
    description: 'تاریخ شروع مرخصی (فرمت YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2026-05-15',
    description: 'تاریخ پایان مرخصی (فرمت YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    example: 'مسافرت کاری',
    description: 'توضیحات دلخواه برای درخواست مرخصی',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

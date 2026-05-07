import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'مرخصی استحقاقی', description: 'نام نوع مرخصی' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 26,
    description: 'تعداد روز مجاز در سال (0 برای نامحدود)',
  })
  @IsInt()
  @Min(0)
  daysPerYear: number;

  @ApiPropertyOptional({
    example: true,
    description: 'نیاز به تأیید مدیر دارد؟',
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ example: '#4CAF50', description: 'کد رنگ برای نمایش' })
  @IsString()
  @IsOptional()
  colorCode?: string;
}

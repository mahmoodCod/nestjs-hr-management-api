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
  @ApiProperty({ example: 'paid leave', description: 'Leave type name' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 26,
    description: 'Number of days allowed per year (0 for unlimited)',
  })
  @IsInt()
  @Min(0)
  daysPerYear: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Need admin approval?',
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({
    example: '#4CAF50',
    description: 'Color code for display',
  })
  @IsString()
  @IsOptional()
  colorCode?: string;
}

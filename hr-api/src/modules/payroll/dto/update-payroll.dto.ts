import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdatePayrollDto {
  @ApiPropertyOptional({
    example: '1404/08',
    description: 'Payroll month and year',
  })
  @IsString({ message: 'Month and year must be a string' })
  @Matches(/^\d{4}\/\d{2}$/, { message: 'Invalid date format. Use YYYY-MM' })
  @IsNotEmpty({ message: 'Month and year is required' })
  salaryPeriod?: string;

  @ApiPropertyOptional({
    example: 5000000,
    description: 'Basic rights',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Basic rights must be a number' })
  @Min(0, { message: 'Basic rights must be greater than 0' })
  @IsNotEmpty({ message: 'Basic rights is required' })
  baseSalary: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Bonuses',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Bonuses must be a number' })
  @Min(0, { message: 'Bonuses must be greater than 0' })
  @IsOptional()
  bonuses?: number;

  @ApiPropertyOptional({
    example: 200000,
    description: 'Deductions',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Deductions must be a number' })
  @Min(0, { message: 'Deductions must be greater than 0' })
  @IsOptional()
  deductions?: number;
}

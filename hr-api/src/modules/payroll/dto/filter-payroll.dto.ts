import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { PayrollStatus } from '../enums/payroll-status.enum';

export class FilterPayrollDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'User ID(For administrators only)',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID must be a number' })
  @Min(1, { message: 'ID must be greater than 0' })
  userId?: number;

  @ApiPropertyOptional({
    example: '1404/08',
    description: 'Payroll month and year',
  })
  @IsString({ message: 'Month and year must be a string' })
  @Matches(/^\d{4}\/\d{2}$/, { message: 'Invalid date format. Use YYYY-MM' })
  @IsOptional()
  salaryPeriod?: string;

  @ApiPropertyOptional({
    example: PayrollStatus.PENDING,
    description: 'payment date',
    enum: PayrollStatus,
  })
  @IsOptional()
  status?: PayrollStatus;
}

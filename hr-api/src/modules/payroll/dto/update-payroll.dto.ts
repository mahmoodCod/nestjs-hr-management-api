import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { PayrollStatus } from '../enums/payroll-status.enum';

export class UpdatePayrollDto {
  @ApiPropertyOptional({
    example: '1404/08',
    description: 'Payroll month and year',
  })
  @IsString({ message: 'Month and year must be a string' })
  @Matches(/^\d{4}\/\d{2}$/, { message: 'Invalid date format. Use YYYY-MM' })
  @IsOptional()
  salaryPeriod?: string;

  @ApiPropertyOptional({
    example: 5000000,
    description: 'Basic rights',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Basic rights must be a number' })
  @Min(0, { message: 'Basic rights must be greater than 0' })
  @IsOptional()
  baseSalary?: number;

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

  @ApiPropertyOptional({
    example: PayrollStatus.PENDING,
    description: 'payment date',
    enum: PayrollStatus,
  })
  @IsEnum(PayrollStatus, {
    message: `The status should be ${PayrollStatus.PENDING} or ${PayrollStatus.PAID}`,
  })
  @IsOptional()
  status?: PayrollStatus;

  @ApiPropertyOptional({
    example: 'Payment made',
    description: 'Additional notes',
  })
  @IsString({ message: 'Notes must be a string' })
  @IsOptional()
  notes?: string;
}

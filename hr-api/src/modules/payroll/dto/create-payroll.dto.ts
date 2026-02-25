import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreatePayrollDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID must be a number' })
  @Min(1, { message: 'ID must be greater than 0' })
  @IsNotEmpty({ message: 'ID is required' })
  userId: number;

  @ApiProperty({
    example: '1404/08',
    description: 'Payroll month and year',
  })
  @IsString({ message: 'Month and year must be a string' })
  @Matches(/^\d{4}\/\d{2}$/, { message: 'Invalid date format. Use YYYY-MM' })
  @IsNotEmpty({ message: 'Month and year is required' })
  salaryPeriod: string;

  @ApiProperty({
    example: 5000000,
    description: 'Basic rights',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Basic rights must be a number' })
  @Min(0, { message: 'Basic rights must be greater than 0' })
  @IsNotEmpty({ message: 'Basic rights is required' })
  baseSalary: number;
}

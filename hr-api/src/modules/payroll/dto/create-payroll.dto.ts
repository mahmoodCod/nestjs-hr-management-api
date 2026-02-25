import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

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
}

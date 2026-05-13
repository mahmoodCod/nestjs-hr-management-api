import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { EmploymentType } from '../enums/employment-type.enum';

export class CreateJobPostDto {
  @ApiProperty({ example: 'Senior Backend Developer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'We are looking for...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId: number;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;
}

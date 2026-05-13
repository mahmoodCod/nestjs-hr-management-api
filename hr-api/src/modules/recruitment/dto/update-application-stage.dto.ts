import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';

export class UpdateApplicationStageDto {
  @ApiProperty({ enum: ApplicationStage })
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @ApiPropertyOptional({ example: 'Good technical skills' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 85 })
  @IsInt()
  @IsOptional()
  interviewScore?: number;

  @ApiPropertyOptional({ example: 'Lack of required certification' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

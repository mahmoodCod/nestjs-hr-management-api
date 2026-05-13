import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 1, description: 'Job post ID' })
  @IsInt()
  jobPostId: number;

  @ApiPropertyOptional({ description: 'Additional notes from candidate' })
  @IsString()
  @IsOptional()
  notes?: string;
}

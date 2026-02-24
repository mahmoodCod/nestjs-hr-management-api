import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckInOutDto {
  @ApiPropertyOptional({
    example: 'Entry due to traffic',
    description: 'Optional note for entry or exit',
  })
  @IsString({ message: 'Note must be a string' })
  @IsOptional()
  notes?: string;
}

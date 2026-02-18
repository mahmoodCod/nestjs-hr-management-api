import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../shared/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'phone number', example: '09932915475' })
  @IsString({ message: 'Mobile must be a string' })
  mobile: string;

  @ApiProperty({ description: 'your password', example: 'MahmoodZar1' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;
}

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../../shared/enums/user-role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'phone number',
    example: '09932915475',
    pattern: '^09\\d{9}$',
    minLength: 11,
    maxLength: 11,
  })
  @IsString({ message: 'Mobile must be a string' })
  @IsNotEmpty({ message: 'Mobile is required' })
  @Matches(/^09\d{9}$/, {
    message:
      'The mobile number should match the pattern of the Iranian mobile number (09xxxxxxx).',
  })
  mobile: string;

  @ApiProperty({
    description: 'your password',
    example: 'MahmoodZar1',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    description: 'User role (manager or employee)',
    example: 'employee',
    enum: Role,
    enumName: 'Role',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: 'The user role must be one of the values ​​of manager or employee',
  })
  role?: Role;
}

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../shared/enums/user-role.enum';

export class RegisterDto {
  @IsString({ message: 'Mobile must be a string' })
  mobile: string;

  @IsString({ message: 'Password must be a string' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;
}

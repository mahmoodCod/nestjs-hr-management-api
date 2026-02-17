import { IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Mobile must be a string' })
  mobile: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}

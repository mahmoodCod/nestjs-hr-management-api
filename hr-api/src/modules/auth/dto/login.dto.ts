import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
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
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

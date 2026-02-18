import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(
      dto.mobile,
      dto.password,
      dto.role,
    );

    return user;
  }

  // Handles user authentication process.
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.mobile, dto.password);

    const tokens = await this.authService.login(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Validates the provided refresh token and issues new access and refresh tokens.
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken)
      throw new UnauthorizedException('Refresh token missing !!');

    const tokens = await this.authService.refreshToken(body.refreshToken);

    return {
      accessToken: tokens?.newAccessToken,
      refreshToken: tokens?.newRefreshToken,
    };
  }
}

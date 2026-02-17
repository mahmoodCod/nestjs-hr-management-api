import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from 'src/shared/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private rtRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // Registers a new user in the system
  async register(mobile: string, password: string, role: Role = Role.EMPLOYEE) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      mobile,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  // Validates user login credentials and returns the user if valid
  async validateUser(mobile: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { mobile },
    });

    if (!user)
      throw new NotFoundException(
        `User with this mobile ${mobile} number was not found`,
      );
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('The password entered is not correct');

    return user;
  }

  // Authenticates a user and generates JWT tokens
  async login(user: User) {
    const payload = { sub: user.id, role: user.role };

    // access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('ACCESS_TOKEN_EXPIRES'),
    });

    // refresh token
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES'),
      },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const rt = this.rtRepository.create({ tokenHash, user });
    await this.rtRepository.save(rt);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}

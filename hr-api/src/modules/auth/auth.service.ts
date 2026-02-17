import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
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
      expiresIn: this.config.get('ACCESS_TOKEN_EXPIRES') || '15m',
    });

    // refresh token
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES') || '14d',
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

  // Implements secure refresh token rotation strategy
  async refreshToken(userId: number, providedRefreshToken: string) {
    const tokens = await this.rtRepository.find({
      where: { user: { id: userId }, revokedAt: IsNull() },
      relations: ['user'],
    });

    for (const rt of tokens) {
      const match = await bcrypt.compare(providedRefreshToken, rt.tokenHash);

      if (match) {
        rt.revokedAt = new Date();
        await this.rtRepository.save(rt);

        const user = rt.user;

        const payload = { sub: user.id, role: user.role };

        // access token
        const newAccessToken = this.jwtService.sign(payload, {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get('ACCESS_TOKEN_EXPIRES') || '15m',
        });

        // refresh token
        const newRefreshToken = this.jwtService.sign(
          { sub: user.id },
          {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES') || '14d',
          },
        );

        const tokenHash = await bcrypt.hash(newRefreshToken, 10);
        const refreshToken = this.rtRepository.create({ tokenHash, user });
        await this.rtRepository.save(refreshToken);

        return {
          newAccessToken,
          newRefreshToken,
        };
      }
    }
  }

  // Performs global logout for a user
  async logout(userId: number) {
    await this.rtRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: () => 'NOW()' })
      .where('userId = :id', { id: userId })
      .execute();
  }

  // Finds a user by ID or throws NotFoundException if not found
  async findUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}

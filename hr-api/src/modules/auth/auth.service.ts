import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from 'src/shared/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private rtRepository: Repository<RefreshToken>,
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
}

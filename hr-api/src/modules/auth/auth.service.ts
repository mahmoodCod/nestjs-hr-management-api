import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from 'src/shared/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private rtRepository: Repository<RefreshToken>,
  ) {}

  async register(mobile: string, password: string, role: Role = Role.EMPLOYEE) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      mobile,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }
}

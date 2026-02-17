import { Role } from 'src/shared/enums/user-role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  mobile: string;

  @Column()
  password: string; // hashed password

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;
}

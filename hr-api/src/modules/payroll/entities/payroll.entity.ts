import { User } from 'src/modules/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: 'varchar', length: 7 })
  salaryPeriod: string;

  @Column()
  baseSalary: number;

  @Column()
  bonuses: number;

  @Column()
  deduction: number;

  @Column()
  totalAmount: number;
}

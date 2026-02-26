import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { PayrollManagerController } from './controllers/payroll-manager.controller';
import { PayrollManagerService } from './services/payroll-manager.service';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, User])],

  controllers: [PayrollManagerController],

  providers: [PayrollManagerService],
})
export class PayrollModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentsManagerController } from './controllers/manager.department.controller';
import { DepartmentsManagerService } from './services/manager.department.service';
import { DepartmentsEmployeeController } from './controllers/employee.department.controller';
import { DepartmentsEmployeeService } from './services/employee.department.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],

  controllers: [DepartmentsManagerController, DepartmentsEmployeeController],
  providers: [DepartmentsManagerService, DepartmentsEmployeeService],
})
export class DepartmentModule {}

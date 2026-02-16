import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentsManagerController } from './controllers/manager.department.controller';
import { DepartmentsManagerService } from './services/manager.department.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],

  controllers: [DepartmentsManagerController],
  providers: [DepartmentsManagerService],
})
export class DepartmentModule {}

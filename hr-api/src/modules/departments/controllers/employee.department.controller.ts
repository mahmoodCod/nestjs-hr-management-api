import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DepartmentsEmployeeService } from '../services/employee.department.service';
import { Department } from '../entities/department.entity';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/shared/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Roles(Role.EMPLOYEE)
@Controller('employee/departments')
export class DepartmentsEmployeeController {
  constructor(
    private readonly departmentsService: DepartmentsEmployeeService,
  ) {}

  // GET/employee/departments
  @Get()
  async findAll(): Promise<Department[]> {
    return await this.departmentsService.findAll();
  }

  // GET/employee/department/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return await this.departmentsService.findOne(id);
  }
}

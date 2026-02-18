import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DepartmentsEmployeeService } from '../services/employee.department.service';
import { Department } from '../entities/department.entity';

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

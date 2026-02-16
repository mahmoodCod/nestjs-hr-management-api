import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DepartmentsManagerService } from '../services/manager.department.service';
import { CreateDepartmentDto } from '../dto/create.department.dto';
import { Department } from '../entities/department.entity';

@Controller('manager/departments')
export class DepartmentsManagerController {
  constructor(private readonly departmentService: DepartmentsManagerService) {}

  // POST/manager/departments
  @Post()
  async create(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return await this.departmentService.create(dto);
  }

  // GET/manager/departments
  @Get()
  async findAll(): Promise<Department[]> {
    return await this.departmentService.findAll();
  }

  // GET/managet/department/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return await this.departmentService.findOne(id);
  }
}

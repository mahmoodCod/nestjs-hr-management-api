import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DepartmentsManagerService } from '../services/manager.department.service';
import { CreateDepartmentDto } from '../dto/create.department.dto';
import { Department } from '../entities/department.entity';
import { UpdateDepartmentDto } from '../dto/update.department.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/shared/enums/user-role.enum';

@ApiBearerAuth()
@Roles(Role.MANAGER)
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

  // PATCH/manager/department/:id
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<Department> {
    return await this.departmentService.update(id, dto);
  }

  // DELETE/manager/department/:id
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.departmentService.remove(id);

    return { success: true };
  }
}

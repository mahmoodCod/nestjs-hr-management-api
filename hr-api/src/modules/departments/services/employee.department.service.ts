import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DepartmentsEmployeeService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  // Receive all departments
  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      order: { name: 'ASC' },
    });
  }

  // Get a department with ID
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    return department;
  }
}

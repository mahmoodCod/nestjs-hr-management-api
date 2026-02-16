import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from '../dto/create.department.dto';

@Injectable()
export class DrepertmentManagerService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  // create new depertment
  async create(payload: CreateDepartmentDto): Promise<Department> {
    const depertment = this.departmentRepository.create(payload);

    return this.departmentRepository.save(depertment);
  };

  // get all departments
  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
        order: { createAt: 'DESC' },
    });
  };
}

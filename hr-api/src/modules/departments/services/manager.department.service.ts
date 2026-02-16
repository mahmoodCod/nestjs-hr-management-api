import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity';
import { Repository } from 'typeorm';

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
  }
}

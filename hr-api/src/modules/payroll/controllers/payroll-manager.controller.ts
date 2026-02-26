import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../../modules/auth/decorators/roles.decorator';
import { Role } from '../../../shared/enums/user-role.enum';
import { PayrollManagerService } from '../services/payroll-manager.service';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { Payroll } from '../entities/payroll.entity';
import { FilterPayrollDto } from '../dto/filter-payroll.dto';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';

@ApiBearerAuth()
@Roles(Role.MANAGER)
@Controller('manager/payroll')
export class PayrollManagerController {
  constructor(private readonly peyrollService: PayrollManagerService) {}

  @Post()
  @ApiOperation({ summary: 'Create new payroll' })
  async create(@Body() dto: CreatePayrollDto): Promise<Payroll> {
    return await this.peyrollService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Receive all new salaries' })
  async findAll(@Query() filters: FilterPayrollDto): Promise<Payroll[]> {
    return await this.peyrollService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Receive one salary' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Payroll> {
    return await this.peyrollService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one salary' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollDto,
  ): Promise<Payroll> {
    return await this.peyrollService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one salary' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.peyrollService.remove(id);
    return { success: true };
  }
}

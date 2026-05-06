import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave.request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave.request.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveService.create(createLeaveRequestDto);
  }

  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    return this.leaveService.update(+id, updateLeaveRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}

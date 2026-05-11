import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}
}

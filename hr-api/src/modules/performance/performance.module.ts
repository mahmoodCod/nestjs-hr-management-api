import { Module } from '@nestjs/common';
import { PerformanceService } from './services/performance.service';
import { PerformanceController } from './controllers/employee-performance.controller';

@Module({
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}

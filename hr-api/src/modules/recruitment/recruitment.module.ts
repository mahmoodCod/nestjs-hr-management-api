import { Module } from '@nestjs/common';
import { RecruitmentService } from './services/recruitment.service';
import { RecruitmentController } from './controllers/employee-recruitment.controller';

@Module({
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}

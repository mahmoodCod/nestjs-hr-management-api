import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPost } from './entities/job-post.entity';
import { Candidate } from './entities/candidate.entity';
import { Application } from './entities/application.entity';
import { ManagerRecruitmentController } from './controllers/manager-recruitment.controller';
import { EmployeeRecruitmentController } from './controllers/employee-recruitment.controller';
import { RecruitmentService } from './services/recruitment.service';

/**
 * Recruitment Module
 * Manages job postings, candidate profiles, and the application workflow.
 * Exposes endpoints for both employees (job search, apply, track) and managers (full control).
 */
@Module({
  imports: [TypeOrmModule.forFeature([JobPost, Candidate, Application])],
  controllers: [EmployeeRecruitmentController, ManagerRecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}

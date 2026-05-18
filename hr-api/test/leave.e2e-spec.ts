import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { request } from 'http';
import { AppModule } from 'src/app.module';
import { LeaveRequest } from 'src/modules/leave/entities/leave-request.entity';
import { LeaveType } from 'src/modules/leave/entities/leave-type.entity';
import { Repository } from 'typeorm';

describe('LeaveController (e2e)', () => {
  let app: INestApplication;
  let leaveRequestRepo: Repository<LeaveRequest>;
  let leaveTypeRepo: Repository<LeaveType>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    leaveRequestRepo = moduleFixture.get<Repository<LeaveRequest>>(
      getRepositoryToken(LeaveRequest),
    );
    leaveTypeRepo = moduleFixture.get<Repository<LeaveType>>(
      getRepositoryToken(LeaveType),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean tables before each test
    await leaveRequestRepo.delete({});
    await leaveTypeRepo.delete({});
    // Insert a default leave type
    await leaveTypeRepo.save({
      id: 1,
      name: 'Paid Leave',
      daysPerYear: 20,
      requiresApproval: true,
    });
  });

  describe('/employee/leave/request (POST)', () => {
    it('should create a leave request for authenticated employee', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'employee1', password: 'password' }); // adjust based on your auth

      const token = loginRes.body.access_token;
    });
  });
});

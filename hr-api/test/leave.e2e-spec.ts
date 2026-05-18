import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { request } from 'http';
import { AppModule } from 'src/app.module';
import { LeaveRequest } from 'src/modules/leave/entities/leave-request.entity';
import { LeaveType } from 'src/modules/leave/entities/leave-type.entity';
import { LeaveRequestStatusEnum } from 'src/modules/leave/enums/leave-request.enum';
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
        .post('/api/v1/auth/login')
        .send({ username: 'employee1', password: 'password' }); // adjust based on your auth

      const token = loginRes.body.access_token;

      const response = await request(app.getHttpServer())
        .post('/api/v1/employee/leave/request')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveTypeId: 1,
          startDate: '2026-06-10',
          endDate: '2026-06-12',
          reason: 'Test leave',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe(LeaveRequestStatusEnum.PENDING);
    });

    it('should fail if no token provided', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/employee/leave/request')
        .send({
          leaveTypeId: 1,
          startDate: '2026-06-10',
          endDate: '2026-06-12',
        })
        .expect(401);
    });
  });

  describe('/manager/leave/:id/status (PATCH)', () => {
    it('should allow manager to approve a leave request', async () => {
      // First create a leave request as employee
      const empToken = await getTokenForUser('employee1');
      const leaveRes = await request(app.getHttpServer())
        .post('/api/v1/employee/leave/request')
        .set('Authorization', `Bearer ${empToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2026-07-01',
          endDate: '2026-07-03',
        })
        .expect(201);
      const leaveId = leaveRes.body.data.id;
    });
  });
});

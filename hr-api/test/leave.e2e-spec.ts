import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LeaveRequest } from '../src/modules/leave/entities/leave-request.entity';
import { LeaveType } from '../src/modules/leave/entities/leave-type.entity';
import { LeaveRequestStatusEnum } from '../src/modules/leave/enums/leave-request.enum';
import { Repository } from 'typeorm';
import { User } from '../src/modules/auth/entities/user.entity';

describe('LeaveController (e2e)', () => {
  let app: INestApplication;
  let leaveRequestRepo: Repository<LeaveRequest>;
  let leaveTypeRepo: Repository<LeaveType>;
  let userRepo: Repository<User>;

  // Helper to get JWT token for a user
  async function getTokenForUser(
    username: string,
    password: string = 'password123',
  ): Promise<string> {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username, password })
      .expect(201);
    return loginRes.body.access_token;
  }

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
    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await leaveRequestRepo.delete({});
    await leaveTypeRepo.delete({});
    // Ensure a default leave type exists (id=1)
    await leaveTypeRepo.save({
      id: 1,
      name: 'Paid Leave',
      daysPerYear: 20,
      requiresApproval: true,
    });
  });

  describe('/employee/leave/request (POST)', () => {
    it('should create a leave request for authenticated employee', async () => {
      // First, ensure an employee user exists (you might need to seed in beforeAll)
      // For simplicity, we assume there is an employee with username 'employee1', password 'password123'
      const token = await getTokenForUser('employee1', 'password123');

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

    it('should fail with invalid leave type', async () => {
      const token = await getTokenForUser('employee1', 'password123');
      await request(app.getHttpServer())
        .post('/api/v1/employee/leave/request')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveTypeId: 999,
          startDate: '2026-06-10',
          endDate: '2026-06-12',
        })
        .expect(404); // Not Found
    });
  });

  describe('/manager/leave/:id/status (PATCH)', () => {
    it('should allow manager to approve a leave request', async () => {
      // Create a leave request as employee
      const empToken = await getTokenForUser('employee1', 'password123');
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

      // Manager approves
      const managerToken = await getTokenForUser('manager1', 'password123');
      await request(app.getHttpServer())
        .patch(`/api/v1/manager/leave/${leaveId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: LeaveRequestStatusEnum.APPROVED })
        .expect(200);

      // Verify status changed
      const updated = await leaveRequestRepo.findOneBy({ id: leaveId });
      expect(updated.status).toBe(LeaveRequestStatusEnum.APPROVED);
    });

    it('should reject if not a manager', async () => {
      // Create leave as employee
      const empToken = await getTokenForUser('employee1', 'password123');
      const leaveRes = await request(app.getHttpServer())
        .post('/api/v1/employee/leave/request')
        .set('Authorization', `Bearer ${empToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2026-07-10',
          endDate: '2026-07-12',
        })
        .expect(201);
      const leaveId = leaveRes.body.data.id;

      // Try to patch as same employee (not manager)
      await request(app.getHttpServer())
        .patch(`/api/v1/manager/leave/${leaveId}/status`)
        .set('Authorization', `Bearer ${empToken}`)
        .send({ status: LeaveRequestStatusEnum.APPROVED })
        .expect(403); // Forbidden
    });
  });
});

/* eslint-disable prettier/prettier */
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
import { Role } from '../src/shared/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

jest.setTimeout(30000); // 30 seconds timeout
describe('LeaveController (e2e)', () => {
  let app: INestApplication;
  let leaveRequestRepo: Repository<LeaveRequest>;
  let leaveTypeRepo: Repository<LeaveType>;
  let userRepo: Repository<User>;

  async function getTokenForUser(
    mobile: string,
    password: string,
  ): Promise<string> {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ mobile, password })
      .expect(201);
    console.log(loginRes.body);
    const token =
      loginRes.body.accessToken || loginRes.body.data?.accessToken;
    if (!token) {
      console.error('Login response:', loginRes.body);
      throw new Error('Token not found in login response');
    }
    return token;
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

    // Create test users
    const hashedPassword = await bcrypt.hash('MahmoodZar1', 10);
    const employeeMobile = '09932915475';
    const managerMobile = '09932915478';

    let employee = await userRepo.findOneBy({ mobile: employeeMobile });
    if (!employee) {
      employee = await userRepo.save({
        mobile: employeeMobile,
        password: hashedPassword,
        role: Role.EMPLOYEE,
      });
    }
    let manager = await userRepo.findOneBy({ mobile: managerMobile });
    if (!manager) {
      manager = await userRepo.save({
        mobile: managerMobile,
        password: hashedPassword,
        role: Role.MANAGER,
      });
    }
    console.log(
      `Test users ready: employee ID ${employee.id}, manager ID ${manager.id}`,
    );
  });

  afterAll(async () => {
    if (app) {
    await app.close();
    }
  });

  beforeEach(async () => {
    await leaveRequestRepo.createQueryBuilder().delete().execute();
    await leaveTypeRepo.createQueryBuilder().delete().execute();
    await leaveTypeRepo.save({
      id: 1,
      name: 'Paid Leave',
      daysPerYear: 20,
      requiresApproval: true,
    });
  });

  describe('/employee/leave/request (POST)', () => {
    it('should create a leave request for authenticated employee', async () => {
      const token = await getTokenForUser('09932915475', 'MahmoodZar1');
      const response = await request(app.getHttpServer())
        .post('/employee/leave/request')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveTypeId: 1,
          startDate: '2026-06-10',
          endDate: '2026-06-12',
          reason: 'Test leave',
        })
        .expect(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.status).toBe(LeaveRequestStatusEnum.PENDING);
    });

    it('should fail if no token provided', async () => {
      await request(app.getHttpServer())
        .post('/employee/leave/request')
        .send({
          leaveTypeId: 1,
          startDate: '2026-06-10',
          endDate: '2026-06-12',
        })
        .expect(401);
    });

    it('should fail with invalid leave type', async () => {
      const token = await getTokenForUser('09932915475', 'MahmoodZar1');
      await request(app.getHttpServer())
        .post('/employee/leave/request')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveTypeId: 999,
          startDate: '2026-06-10',
          endDate: '2026-06-12',
        })
        .expect(404);
    });
  });

  describe('/manager/leave/:id/status (PATCH)', () => {
    it('should allow manager to approve a leave request', async () => {
      const empToken = await getTokenForUser('09932915475', 'MahmoodZar1');
      const leaveRes = await request(app.getHttpServer())
        .post('/employee/leave/request')
        .set('Authorization', `Bearer ${empToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2026-07-01',
          endDate: '2026-07-03',
        })
        .expect(201);
      const leaveId = leaveRes.body.id;

      const managerToken = await getTokenForUser('09932915478', 'MahmoodZar1');
      await request(app.getHttpServer())
        .patch(`/manager/leave/${leaveId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: LeaveRequestStatusEnum.APPROVED })
        .expect(200);
      const updated = await leaveRequestRepo.findOneBy({ id: leaveId });
      expect(updated?.status).toBe(LeaveRequestStatusEnum.APPROVED);
    });

    it('should reject if not a manager', async () => {
      const empToken = await getTokenForUser('09932915475', 'MahmoodZar1');
      const leaveRes = await request(app.getHttpServer())
        .post('/employee/leave/request')
        .set('Authorization', `Bearer ${empToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2026-07-10',
          endDate: '2026-07-12',
        })
        .expect(201);
      const leaveId = leaveRes.body.id;

      await request(app.getHttpServer())
        .patch(`/manager/leave/${leaveId}/status`)
        .set('Authorization', `Bearer ${empToken}`)
        .send({ status: LeaveRequestStatusEnum.APPROVED })
        .expect(403);
    });
  });
});

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { User } from '../src/modules/auth/entities/user.entity';
import { LeaveRequest } from '../src/modules/leave/entities/leave-request.entity';
import { LeaveType } from '../src/modules/leave/entities/leave-type.entity';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../src/shared/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { LeaveRequestStatusEnum } from '../src/modules/leave/enums/leave-request.enum';

jest.setTimeout(30000);

describe('ReportController (e2e)', () => {
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
    const token = loginRes.body.accessToken;
    if (!token) throw new Error('Token not found');
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
    const hashedPassword = await bcrypt.hash('password123', 10);
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

    // Create a leave type
    await leaveTypeRepo.save({
      id: 1,
      name: 'Paid Leave',
      daysPerYear: 20,
      requiresApproval: true,
    });

    // Create some leave requests for the employee (approved and pending)
    await leaveRequestRepo.save([
      {
        userId: employee.id,
        leaveTypeId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-03'),
        durationDays: 3,
        status: LeaveRequestStatusEnum.APPROVED,
        reason: 'Vacation',
      },
      {
        userId: employee.id,
        leaveTypeId: 1,
        startDate: new Date('2026-06-10'),
        endDate: new Date('2026-06-12'),
        durationDays: 3,
        status: LeaveRequestStatusEnum.PENDING,
        reason: 'Sick leave',
      },
    ]);

    console.log(
      `Test users ready: employee ID ${employee.id}, manager ID ${manager.id}`,
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Employee Report Endpoints', () => {
    it('should download leave report as Excel for authenticated employee', async () => {
      const token = await getTokenForUser('09932915475', 'password123');
      const response = await request(app.getHttpServer())
        .get('/employee/report/leave')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check headers for Excel file
      expect(response.headers['content-type']).toMatch(
        /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/,
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="leave_report.xlsx"',
      );
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/employee/report/leave')
        .expect(401);
    });
  });
});

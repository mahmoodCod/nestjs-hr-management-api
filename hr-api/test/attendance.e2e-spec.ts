import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { User } from '../src/modules/auth/entities/user.entity';
import { Role } from '../src/shared/enums/user-role.enum';
import { Attendance } from '../src/modules/attendences/entities/attendance.entity';

describe('attendance (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  // employee data
  let employeeToken: string;
  let employeeId: number;
  //  manager data
  let managerToken: string;
  let managerId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalInterceptors(new TransformResponseInterceptor());

    app.enableCors({
      origin: true,
      Credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();

    // start create or login employee
    const employeeMobile = '09932915475';
    const employeePassword = 'MahmoodZar1';
    const hashedPassword = await bcrypt.hash(employeePassword, 10);

    const employeeRepo = dataSource.getRepository(User);
    let employee = await employeeRepo.findOne({
      where: { mobile: employeeMobile, role: Role.EMPLOYEE },
    });

    if (!employee) {
      employee = employeeRepo.create({
        mobile: employeeMobile,
        password: hashedPassword,
        role: Role.EMPLOYEE,
      });

      employee = await employeeRepo.save(employee);
    }

    employeeId = employee.id;

    const employeeLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        mobile: employeeMobile,
        password: employeePassword,
      });

    employeeToken = employeeLoginResponse.body.data.accessToken;

    // start create or login manger

    const managerMobile = '09932915478';
    const managerPassword = 'MahmoodZar1';
    const hashedPasswordM = await bcrypt.hash(managerPassword, 10);

    const managerRepo = dataSource.getRepository(User);
    let manager = await managerRepo.findOne({
      where: { mobile: managerMobile, role: Role.MANAGER },
    });

    if (!manager) {
      manager = managerRepo.create({
        mobile: managerMobile,
        password: hashedPasswordM,
        role: Role.MANAGER,
      });

      manager = await managerRepo.save(manager);
    }
    managerId = manager.id;

    const managerLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        mobile: managerMobile,
        password: managerPassword,
      });

    managerToken = managerLoginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    const attendanceRepo = dataSource.getRepository(Attendance);
    await attendanceRepo.delete({ user: { id: employeeId } });
  });

  describe('Employee Attendance', () => {
    describe('POST /employee/attendance/check-in - check-out', () => {
      it('باید ورود را با موفقیت ثبت کند', () => {
        return request(app.getHttpServer())
          .post('/api/v1/employee/attendance/check-in')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({ notes: 'ورود تست' })
          .expect(201);
      });
    });

    describe('Employee Attendance', () => {
      describe('POST /employee/attendance/check-out', () => {
        it('باید ورود را با موفقیت ثبت کند', () => {
          return request(app.getHttpServer())
            .post('/api/v1/employee/attendance/check-out')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({ notes: 'خروج تست' })
            .expect(201);
        });
      });
    });

    describe('Get/employee/attendance', () => {
      it('It should return the attendance and absence list of the employee', () => {
        return request(app.getHttpServer())
          .get('/api/v1/employee/attendance')
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(200);
      });

      it('It should return the attendance and absence list of the employee', () => {
        return request(app.getHttpServer())
          .get('/api/v1/employee/attendance')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(403);
      });
    });
  });
});

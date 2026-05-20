import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { User } from 'src/modules/auth/entities/user.entity';
import { LeaveRequest } from 'src/modules/leave/entities/leave-request.entity';
import { LeaveType } from 'src/modules/leave/entities/leave-type.entity';
import { Repository } from 'typeorm';

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
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { DataSource } from 'typeorm';

describe('attendance (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let employeeToken: string;
  let employeeId: number;

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
  });
});

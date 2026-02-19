import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  // set api global prefix
  app.setGlobalPrefix('api/v1');

  // enable validation global
  app.useGlobalPipes(new ValidationPipe());

  // enable response transformation
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // start manager swagger
  const managerConfig = new DocumentBuilder()
    .setTitle('Hr api - manager routes')
    .setDescription(
      'This root is related to the manager user role and is used in the manager plan.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const managerDocument = SwaggerModule.createDocument(app, managerConfig, {
    include: [AppModule],
    deepScanRoutes: true,
  });

  if (managerDocument.paths) {
    Object.keys(managerDocument.paths).forEach((path) => {
      if (!path.includes('/manager') && !path.includes('/auth')) {
        delete managerDocument.paths[path];
      }
    });
  }

  // start employee swagger
  const employeeConfig = new DocumentBuilder()
    .setTitle('Hr api - employee routes')
    .setDescription(
      'This root is related to the employee user role and is used in the employee plan.',
    )
    .setVersion('1.0')
    .build();

  const employeeDocument = SwaggerModule.createDocument(app, employeeConfig, {
    include: [AppModule],
    deepScanRoutes: true,
  });

  if (employeeDocument.paths) {
    Object.keys(employeeDocument.paths).forEach((path) => {
      if (!path.includes('/employee') && !path.includes('/auth')) {
        delete employeeDocument.paths[path];
      }
    });
  }
  SwaggerModule.setup('api/v1/employee/docs', app, employeeDocument);
  SwaggerModule.setup('api/v1/manager/docs', app, managerDocument);

  await app.listen(port);
}
void bootstrap();

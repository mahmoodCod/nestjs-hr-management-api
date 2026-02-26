import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from './modules/departments/departments.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAurhGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { AttendanceModule } from './modules/attendences/attendances.module';
import { PayrollModule } from './modules/payroll/payroll.module';

@Module({
  imports: [
    // config module for get env variable data
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // db conection typeorm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', 3306)),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'hr-api'),
        entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', true) === 'true',
      }),
      inject: [ConfigService],
    }),

    // import project module
    AuthModule,
    DepartmentModule,
    AttendanceModule,
    PayrollModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAurhGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Builds TypeORM options from env vars or DATABASE_URL (Render / cloud hosts).
 */
export function buildTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (databaseUrl) {
    const parsed = parseMysqlUrl(databaseUrl);
    if (parsed) {
      return {
        type: 'mysql',
        ...parsed,
        entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
        synchronize:
          configService.get('DB_SYNCHRONIZE', 'true') === 'true',
        ssl: configService.get('DB_SSL', 'false') === 'true',
      };
    }
  }

  return {
    type: 'mysql',
    host: configService.get('DB_HOST', 'localhost'),
    port: Number(configService.get('DB_PORT', 3306)),
    username: configService.get('DB_USERNAME', 'root'),
    password: configService.get('DB_PASSWORD', ''),
    database: configService.get('DB_NAME', 'hr-api'),
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', 'true') === 'true',
    ssl: configService.get('DB_SSL', 'false') === 'true',
  };
}

function parseMysqlUrl(url: string): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} | null {
  try {
    const normalized = url.replace(/^mysql:\/\//, 'http://');
    const parsed = new URL(normalized);
    const database = parsed.pathname.replace(/^\//, '');
    if (!parsed.hostname || !database) return null;

    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database,
    };
  } catch {
    return null;
  }
}

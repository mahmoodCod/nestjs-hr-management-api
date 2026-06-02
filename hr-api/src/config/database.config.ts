import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const logger = new Logger('DatabaseConfig');

/**
 * Builds TypeORM options from env vars or connection URL (Render / cloud hosts).
 */
export function buildTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const connectionUrl = firstDefined(
    configService.get<string>('DATABASE_URL'),
    configService.get<string>('MYSQL_URL'),
    configService.get<string>('MYSQL_INTERNAL_URL'),
  );

  if (connectionUrl) {
    const parsed = parseMysqlUrl(connectionUrl);
    if (parsed) {
      logConnectionTarget(parsed.host, parsed.port, parsed.database, 'url');
      return toTypeOrmOptions(parsed, configService);
    }
    logger.warn('DATABASE_URL is set but could not be parsed as mysql:// URL');
  }

  const host = firstDefined(
    configService.get<string>('DB_HOST'),
    configService.get<string>('MYSQL_HOST'),
    configService.get<string>('MYSQLHOST'),
  );

  const port = Number(
    firstDefined(
      configService.get<string>('DB_PORT'),
      configService.get<string>('MYSQL_PORT'),
      configService.get<string>('MYSQLPORT'),
    ) ?? 3306,
  );

  const username: string =
    firstDefined(
      configService.get<string>('DB_USERNAME'),
      configService.get<string>('MYSQL_USER'),
      configService.get<string>('MYSQLUSER'),
    ) ?? 'root';

  const password = firstDefined(
    configService.get<string>('DB_PASSWORD'),
    configService.get<string>('MYSQL_PASSWORD'),
    configService.get<string>('MYSQLPASSWORD'),
    '',
  );

  const database: string =
    firstDefined(
      configService.get<string>('DB_NAME'),
      configService.get<string>('DB_DATABASE'),
      configService.get<string>('MYSQL_DATABASE'),
      configService.get<string>('MYSQLDATABASE'),
    ) ?? 'hr-api';

  const resolvedHost = host ?? 'localhost';

  assertProductionHost(resolvedHost);

  logConnectionTarget(resolvedHost, port, database, 'env');

  return {
    type: 'mysql',
    host: resolvedHost,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', 'true') === 'true',
    ssl: configService.get('DB_SSL', 'false') === 'true',
  };
}

function toTypeOrmOptions(
  parsed: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  },
  configService: ConfigService,
): TypeOrmModuleOptions {
  assertProductionHost(parsed.host);

  return {
    type: 'mysql',
    ...parsed,
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', 'true') === 'true',
    ssl: configService.get('DB_SSL', 'false') === 'true',
  };
}

function assertProductionHost(host: string): void {
  if (process.env.NODE_ENV !== 'production') return;

  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === '::1';

  if (isLocal) {
    throw new Error(
      'Database host is localhost in production. Set DATABASE_URL or DB_HOST (and related DB_* vars) in Render Environment, or link your MySQL instance to this Web Service.',
    );
  }
}

function logConnectionTarget(
  host: string,
  port: number,
  database: string,
  source: 'url' | 'env',
): void {
  logger.log(
    `MySQL target (${source}): host=${host} port=${port} database=${database}`,
  );
}

function firstDefined<T>(...values: (T | undefined)[]): T | undefined {
  return values.find((value) => value !== undefined && value !== '');
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
    const database = parsed.pathname.replace(/^\//, '').split('?')[0];
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

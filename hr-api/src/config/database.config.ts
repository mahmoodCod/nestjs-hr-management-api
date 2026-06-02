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

  const password: string =
    firstDefined(
      configService.get<string>('DB_PASSWORD'),
      configService.get<string>('MYSQL_PASSWORD'),
      configService.get<string>('MYSQLPASSWORD'),
    ) ?? '';

  const database: string =
    firstDefined(
      configService.get<string>('DB_NAME'),
      configService.get<string>('DB_DATABASE'),
      configService.get<string>('MYSQL_DATABASE'),
      configService.get<string>('MYSQLDATABASE'),
    ) ?? 'hr-api';

  const resolvedHost = host ?? 'localhost';

  warnIfLocalhostInProduction(resolvedHost);

  logConnectionTarget(resolvedHost, port, database, 'env');

  return toTypeOrmOptions(
    {
      host: resolvedHost,
      port,
      username,
      password,
      database,
    },
    configService,
  );
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
  warnIfLocalhostInProduction(parsed.host);

  const deferConnection =
    process.env.NODE_ENV === 'production' && isLocalhost(parsed.host);

  if (deferConnection) {
    logger.warn(
      'MySQL not configured on host — starting API without DB connection. Set DATABASE_URL or DB_HOST in Render when MySQL is ready.',
    );
  }

  return {
    type: 'mysql',
    ...parsed,
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', 'true') === 'true',
    ssl: configService.get('DB_SSL', 'false') === 'true',
    manualInitialization: deferConnection,
  };
}

function isLocalhost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function warnIfLocalhostInProduction(host: string): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!isLocalhost(host)) return;

  logger.warn(
    'DB_HOST is localhost in production. API will start, but database routes fail until you set DATABASE_URL or a real DB_HOST on Render.',
  );
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
    const normalized = url.replace(/^mysql2?:\/\//, 'http://');
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

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
    configService.get<string>('POSTGRES_URL'),
    configService.get<string>('POSTGRES_INTERNAL_URL'),
  );

  if (connectionUrl) {
    const parsed = parsePostgresUrl(connectionUrl);
    if (parsed) {
      logConnectionTarget(parsed.host, parsed.port, parsed.database, 'url');
      return toTypeOrmOptions(parsed, configService);
    }
    logger.warn(
      'DATABASE_URL is set but could not be parsed as postgresql:// URL',
    );
  }

  const host = firstDefined(
    configService.get<string>('DB_HOST'),
    configService.get<string>('POSTGRES_HOST'),
    configService.get<string>('PGHOST'),
  );

  const port = Number(
    firstDefined(
      configService.get<string>('DB_PORT'),
      configService.get<string>('POSTGRES_PORT'),
      configService.get<string>('PGPORT'),
    ) ?? 5432,
  );

  const username: string =
    firstDefined(
      configService.get<string>('DB_USERNAME'),
      configService.get<string>('POSTGRES_USER'),
      configService.get<string>('PGUSER'),
    ) ?? 'postgres';

  const password: string =
    firstDefined(
      configService.get<string>('DB_PASSWORD'),
      configService.get<string>('POSTGRES_PASSWORD'),
      configService.get<string>('PGPASSWORD'),
    ) ?? '';

  const database: string =
    firstDefined(
      configService.get<string>('DB_NAME'),
      configService.get<string>('DB_DATABASE'),
      configService.get<string>('POSTGRES_DB'),
      configService.get<string>('PGDATABASE'),
    ) ?? 'hr_api';

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
      'PostgreSQL not configured on host — starting API without DB connection. Set DATABASE_URL or DB_HOST in Render when the database is ready.',
    );
  }

  return {
    type: 'postgres',
    ...parsed,
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', 'true') === 'true',
    ssl: buildSslOptions(configService),
    manualInitialization: deferConnection,
  };
}

function buildSslOptions(
  configService: ConfigService,
): boolean | { rejectUnauthorized: boolean } {
  if (configService.get('DB_SSL', 'false') !== 'true') {
    return false;
  }

  return {
    rejectUnauthorized:
      configService.get('DB_SSL_REJECT_UNAUTHORIZED', 'false') === 'true',
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
    `PostgreSQL target (${source}): host=${host} port=${port} database=${database}`,
  );
}

function firstDefined<T>(...values: (T | undefined)[]): T | undefined {
  return values.find((value) => value !== undefined && value !== '');
}

function parsePostgresUrl(url: string): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} | null {
  try {
    const normalized = url.replace(/^postgres(?:ql)?:\/\//, 'http://');
    const parsed = new URL(normalized);
    const database = parsed.pathname.replace(/^\//, '').split('?')[0];
    if (!parsed.hostname || !database) return null;

    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database,
    };
  } catch {
    return null;
  }
}

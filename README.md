# HR Management API

A production-oriented, role-aware backend API for Human Resources workflows, built with **NestJS**, **TypeORM**, and **MySQL**.

This project provides a clean foundation for HR systems with:
- authentication and token lifecycle management,
- role-based access boundaries (manager vs employee),
- modular domain organization,
- Swagger documentation split by audience,
- and container-ready deployment assets.

---

## Table of Contents

- [Why This Project](#why-this-project)
- [Core Capabilities](#core-capabilities)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run in Development](#run-in-development)
- [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [Validation and Response Format](#validation-and-response-format)
- [Testing](#testing)
- [NPM Scripts](#npm-scripts)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Roadmap Ideas](#roadmap-ideas)
- [Contributing](#contributing)
- [License](#license)

---

## Why This Project

Most internal HR backends begin as simple CRUD services and quickly become hard to maintain when policies, roles, and audit requirements expand.  
This API is structured from day one to support growth:

- **Role-separated flows** for managers and employees,
- **modular boundaries** for scaling features independently,
- **predictable API contracts** with validation and response shaping,
- and **deployment-ready infrastructure** for local and containerized environments.

---

## Core Capabilities

- **Authentication**
  - Register and login flows
  - JWT access and refresh token strategy
  - Refresh token persistence and revocation logic
  - Global logout support

- **Authorization**
  - Role enum and role-aware guards
  - Custom decorator patterns for protected routes (`@Roles`, `@Public`)

- **Departments**
  - Manager-side CRUD operations
  - Employee-side read-only access

- **Attendance**
  - Employee check-in / check-out flow
  - Employee attendance history retrieval
  - Manager team attendance listing with date filters

- **Leave**
  - Employee leave request creation, cancellation, and balance tracking
  - Manager-side request review and status updates (approve/reject)
  - Manager CRUD for leave types and yearly limits

- **Payroll**
  - Manager payroll record creation, update, and lifecycle management
  - Employee self-service payroll history view
  - Status-aware calculations and filtering

- **Performance**
  - Manager performance cycle and KPI management
  - Evaluation creation with weighted KPI scoring
  - Employee evaluation listing and detail with score breakdown

- **Recruitment**
  - Manager job post CRUD and candidate/application oversight
  - Application stage pipeline (screening, interviews, offer, hire/reject)
  - Employee job browsing, profile setup, and application submission

- **Notifications**
  - Employee-scoped notification inbox
  - Mark-single and mark-all-as-read workflows
  - Manager-side system-wide notification listing
  - Leave workflow integration for request-created and status-changed alerts

- **Reports**
  - Employee leave report export (Excel)
  - Manager team leave report export with optional filters
  - Report generation backed by leave and user data queries

- **File Upload**
  - Multipart upload endpoint with MIME and size validation
  - Static serving from the uploads directory

- **API Experience**
  - Versioned API prefix (`/api/v1`)
  - Dedicated Swagger surfaces for manager and employee routes
  - Uniform response structure via global interceptor

---

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** MySQL
- **Auth:** Passport + JWT + bcrypt
- **Validation:** class-validator + class-transformer
- **Docs:** Swagger (`@nestjs/swagger`)
- **Reports:** ExcelJS
- **Testing:** Jest + Supertest (e2e)
- **Containerization:** Docker + Docker Compose

---

## Project Structure

```text
hr-api/
  src/
    app.module.ts
    main.ts
    common/
      interceptors/
    modules/
      auth/           # JWT, guards, user & refresh-token entities
      departments/    # manager + employee department controllers
      attendences/    # check-in/out, manager team listing
      leave/          # requests, types, approval workflow
      payroll/        # manager CRUD + employee self-view
      performance/    # cycles, KPIs, evaluations
      recruitment/    # job posts, candidates, applications
      notification/   # inbox and read-state management
      report/         # Excel leave report exports
    shared/
      enums/
  test/
    attendance.e2e-spec.ts
    leave.e2e-spec.ts
    report.e2e-spec.ts
    app.e2e-spec.ts
Dockerfile
docker-compose.yml
```

---

## Architecture Notes

- **Modular design:** each domain owns its controllers, services, DTOs, and entities.
- **Config-first setup:** environment-driven configuration using `ConfigModule`.
- **Role-aware routing:** manager and employee routes are separated for clarity and policy safety.
- **Global pipeline:** validation and response transformation are applied centrally in bootstrap.
- **Stateless auth + managed refresh tokens:** access tokens stay short-lived; refresh tokens are tracked in DB for revocation and rotation scenarios.
- **Dual Swagger surfaces:** route paths are filtered so managers and employees each see only relevant endpoints.

---

## Getting Started

### Prerequisites

- Node.js `>= 20`
- npm `>= 9`
- MySQL instance (local or Docker)

### Installation

From the repository root, install dependencies inside the API package:

```bash
cd hr-api
npm install
```

### Environment Variables

Create `hr-api/.env` (never commit this file). Use placeholders locally and strong unique values in every deployed environment:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hr_api
DB_SYNCHRONIZE=true

JWT_ACCESS_SECRET=replace_with_long_random_string
JWT_REFRESH_SECRET=replace_with_different_long_random_string
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=14d
```

> **Production:** set `DB_SYNCHRONIZE=false` and manage schema with migrations.  
> Generate secrets with a cryptographically secure method — do not reuse example values.

### Run in Development

```bash
cd hr-api
npm run start:dev
```

The API listens on the port defined in `.env` (default `3001`).

---

## Running with Docker

Build and start services from the repository root:

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

Reset volumes (destroys local DB data):

```bash
docker compose down -v
```

---

## API Documentation

After startup, Swagger docs are available at:

- **Manager docs:** `http://localhost:<PORT>/api/v1/manager/docs`
- **Employee docs:** `http://localhost:<PORT>/api/v1/employee/docs`

Auth and upload routes are included in both surfaces where applicable.

### Key Route Groups

All routes are prefixed with `/api/v1`.

| Area | Employee routes | Manager routes |
|------|-----------------|----------------|
| Auth | `/auth/*` | `/auth/*` |
| Departments | `/employee/departments/*` | `/manager/departments/*` |
| Attendance | `/employee/attendance/*` | `/manager/attendance/*` |
| Leave | `/employee/leave/*` | `/manager/leave/*`, `/manager/leave-types/*` |
| Payroll | `/employee/payroll/*` | `/manager/payroll/*` |
| Performance | `/employee/performance/*` | `/manager/performance/*` |
| Recruitment | `/employee/recruitment/*` | `/manager/recruitment/*` |
| Notifications | `/employee/notifications/*` | `/manager/notifications/*` |
| Reports | `/employee/report/*` | `/manager/report/*` |
| Uploads | `/uploads` (POST) | `/uploads` (POST) |

Refer to Swagger for the full request/response schemas and required headers.

---

## Validation and Response Format

- Request payloads are validated through global `ValidationPipe`.
- Successful responses are normalized through a response interceptor:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Protected routes require a valid Bearer access token unless marked `@Public()`.

---

## Testing

From the `hr-api` directory:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage
npm run test:cov
```

E2e suites cover attendance, leave, and report flows. Use a dedicated test database — never point tests at production data.

---

## NPM Scripts

Run from `hr-api/`:

| Script | Description |
|--------|-------------|
| `npm run start` | Start app |
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist` |
| `npm run start:prod` | Run compiled build |
| `npm run lint` | Run ESLint |
| `npm run format` | Apply Prettier |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2e tests |

---

## Troubleshooting

- **Swagger route appears empty**
  - Confirm the module is imported in `AppModule`.
  - Verify route decorators exist on controller methods.
  - Check that the path segment matches the Swagger filter (`/manager` or `/employee`).

- **401 on protected endpoints**
  - Send `Authorization: Bearer <accessToken>`.
  - Confirm JWT secrets in `.env` match the environment that issued the token.
  - Check token expiry settings.

- **403 on manager/employee routes**
  - The authenticated user's role must match the route guard (`MANAGER` vs `EMPLOYEE`).

- **Database connection issues**
  - Verify DB host, port, credentials, and that MySQL is reachable.
  - Ensure the database exists and the user has sufficient privileges.

---

## Security Notes

This section describes practices for operators — not a checklist for bypassing protections.

- **Secrets:** never commit `.env`, real credentials, or JWT signing keys. Use a secret manager in production.
- **Database:** disable `DB_SYNCHRONIZE` outside local development; prefer migrations.
- **CORS:** restrict allowed origins in production instead of wide-open settings.
- **Uploads:** validate file types and sizes (already enforced server-side); serve uploads from a controlled path.
- **Tokens:** keep access tokens short-lived; rotate refresh tokens and signing secrets on a schedule.
- **Exposure:** do not deploy Swagger or debug endpoints to the public internet without authentication or network restrictions.
- **Rate limiting & audit:** add before any internet-facing deployment.

---

## Roadmap Ideas

- Migration-based schema management
- Enhanced audit trail for HR events
- Fine-grained policy layer (resource-level authorization)
- Dedicated payroll and performance e2e coverage
- Caching and performance profiling
- CI/CD pipeline with lint + test gates

---

## Contributing

1. Fork and create a feature branch.
2. Keep modules cohesive and follow existing naming conventions.
3. Add or update tests for behavior changes.
4. Ensure lint and tests pass before opening a PR.
5. Do not include secrets, personal data, or production URLs in commits.

---

## License

This project is currently private/internal.  
Define and add a license file before public distribution.

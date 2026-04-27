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
  - Custom decorator patterns for protected routes

- **Departments Domain**
  - Manager-side CRUD operations
  - Employee-side read-only access

- **Attendance Domain (e2e coverage in progress)**
  - Employee check-in / check-out flow
  - Attendance retrieval scenarios

- **File Upload Pipeline**
  - Multipart upload endpoint
  - MIME and size validation
  - Static serving from uploads directory

- **API Experience**
  - Versioned API prefix (`/api/v1`)
  - Dedicated Swagger surfaces for manager and employee routes
  - Uniform response structure via global interceptor

---

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** MySQL
- **Auth:** Passport + JWT + bcrypt
- **Validation:** class-validator + class-transformer
- **Docs:** Swagger (`@nestjs/swagger`)
- **Testing:** Jest + Supertest (including e2e)
- **Containerization:** Docker + Docker Compose

---

## Project Structure

```text
src/
  app.module.ts
  main.ts
  common/
    interceptors/
  modules/
    auth/
      controllers, dto, entities, guards, strategies
    departments/
      controllers, dto, entities, services
    attendences/
      ...
  shared/
    enums/
test/
  *.e2e-spec.ts
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

---

## Getting Started

### Prerequisites

- Node.js `>= 20` (recommended: latest LTS or project-pinned version)
- npm `>= 9`
- MySQL instance (local or Docker)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env` in the project root and define values similar to:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=hr_api
DB_SYNCHRONIZE=true

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=14d
```

> Use strong secrets in non-local environments.  
> Disable `DB_SYNCHRONIZE` in production and use migrations instead.

### Run in Development

```bash
npm run start:dev
```

---

## Running with Docker

Build and start services:

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

If you want to reset volumes:

```bash
docker compose down -v
```

---

## API Documentation

After startup, Swagger docs are available at:

- **Manager docs:** `http://localhost:<PORT>/api/v1/manager/docs`
- **Employee docs:** `http://localhost:<PORT>/api/v1/employee/docs`

These docs are filtered by route segments and include shared auth endpoints where configured.

---

## Validation and Response Format

- Request payloads are validated through global `ValidationPipe`.
- Successful responses are normalized through a response interceptor into a standard shape:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## Testing

Run unit tests:

```bash
npm run test
```

Run e2e tests:

```bash
npm run test:e2e
```

Run coverage:

```bash
npm run test:cov
```

---

## NPM Scripts

- `npm run start` - start app
- `npm run start:dev` - start app in watch mode
- `npm run build` - compile to `dist`
- `npm run start:prod` - run compiled build
- `npm run lint` - run lint rules
- `npm run format` - apply Prettier formatting
- `npm run test` - run unit tests
- `npm run test:e2e` - run e2e tests

---

## Troubleshooting

- **Swagger route appears empty**
  - Verify module is imported in `AppModule`.
  - Check route decorators (`@Get`, `@Post`, etc.) exist on methods.
  - Confirm Swagger path filtering logic includes your route segment.

- **401 on protected endpoints**
  - Ensure `Authorization: Bearer <accessToken>` header is present.
  - Confirm token secret and expiry values are correct.

- **Database connection issues**
  - Re-check DB credentials and host/port in `.env`.
  - Ensure MySQL service is reachable from app runtime.

---

## Security Notes

- Never commit real secrets to source control.
- Rotate JWT secrets periodically in production.
- Prefer secure secret storage (vault / cloud secret manager).
- Add rate limiting and audit logging before internet-facing deployment.

---

## Roadmap Ideas

- Migration-based schema management
- Enhanced audit trail for HR events
- Fine-grained policy layer (resource-level authorization)
- Caching and performance profiling
- CI/CD pipeline with lint + test gates

---

## Contributing

1. Fork and create a feature branch.
2. Keep modules cohesive and follow existing naming conventions.
3. Add/update tests for behavior changes.
4. Ensure lint and tests pass before opening a PR.

---

## License

This project is currently private/internal.  
Define and add a license file before public distribution.
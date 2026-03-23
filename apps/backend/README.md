# EV Electricity Price Comparison - Backend

NestJS backend application for comparing EV charging costs between current tariffs and dynamic pricing.

## Prerequisites

- Node.js (v20+)
- Docker (for database)

## Getting Started

### 1. Database Setup (Docker / Portainer)

The database is PostgreSQL 17. You can run it locally or on a remote server (e.g., miniPC) using the provided `docker-compose.yml` in the project root.

**Using Docker Compose:**
```bash
docker-compose up -d
```

**Using Portainer:**
1. Create a new Stack named `ev-electricity-price-comparison`.
2. Paste the content of `docker-compose.yml`.
3. Deploy the stack.

### 2. Environment Configuration

Copy the example environment file from the project root and create your own `.env` file in the `apps/backend` directory. The `ConfigModule` in the backend application is configured to look for `.env` files in both the root and the `apps/backend` directory.

```bash
# From project root
cp .env.example apps/backend/.env
```

Keep all your sensitive information and configuration in the `apps/backend/.env` file, which is ignored by git.

**Required variables:**
- `DB_HOST`: Address of your database (e.g., `localhost` or `192.168.1.201`)
- `DB_PORT`: Database port (default `5432`)
- `DB_USERNAME`: Database user (default `postgres`)
- `DB_PASSWORD`: Your secure password
- `DB_DATABASE`: Database name (e.g., `ev_prices`)

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev --prefix apps/backend
```

## Architecture

Follows a feature-first architecture as defined in `.cursor/rules/senior-backend-node-nestjs.mdc`:
- `src/features/`: Domain logic (e.g., pricing, charging)
- `src/shared/`: Cross-cutting concerns (middleware, utils, config)

## Database Schema (TypeORM)

We use TypeORM with `synchronize: true` in development. Entities are located in `src/features/*/entities/*.entity.ts`.
Currently established entities:
- `Tariff`: Stores electricity pricing models (e.g., G11, G12).

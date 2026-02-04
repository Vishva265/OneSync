# OneFlow Backend

Unified project management & finance platform - Plan, Execute, Bill.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT
- **API Docs**: Swagger/OpenAPI

## Quick Start with Docker Compose

\`\`\`bash
# Start all services (backend, PostgreSQL, Redis)
docker-compose up --build

# In another terminal, run migrations and seed
docker exec oneflow_backend npm run db:migrate:deploy
docker exec oneflow_backend npm run db:seed
\`\`\`

The backend will be running on `http://localhost:3000` and Swagger docs at `http://localhost:3000/api/docs`.

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Installation

\`\`\`bash
cd backend
npm install
\`\`\`

### Setup Database

\`\`\`bash
# Create .env file
cp .env.example .env

# Run migrations
npm run db:migrate:dev

# Seed database with sample data
npm run db:seed
\`\`\`

### Run Development Server

\`\`\`bash
npm run start:dev
\`\`\`

The API will be running on `http://localhost:3000` with hot-reload enabled.

## Available Scripts

- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run start:dev` - Start with hot-reload
- `npm run test` - Run unit tests
- `npm run test:cov` - Generate coverage report
- `npm run lint` - Fix linting issues
- `npm run db:migrate:dev` - Create new migration (interactive)
- `npm run db:migrate:deploy` - Apply pending migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (GUI)

## Project Structure

\`\`\`
src/
├── common/              # Shared utilities, guards, decorators
│   ├── decorators/
│   ├── guards/         # JWT, RBAC
│   └── strategies/     # Passport JWT strategy
├── modules/            # Feature modules (CRUD)
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   ├── timesheets/
│   ├── expenses/
│   ├── finance/        # Invoice creation, financials
│   ├── attachments/
│   └── audit/
├── prisma/             # Database client & migrations
├── app.module.ts       # Root module
└── main.ts            # Entry point

prisma/
├── schema.prisma      # Data model
├── migrations/        # Migration files
└── seed.ts           # Seed script
\`\`\`

## API Documentation

Swagger/OpenAPI docs available at `/api/docs` after starting the server.

### Core Endpoints (v1)

**Auth**
- `POST /api/v1/auth/signup` - Sign up new user
- `POST /api/v1/auth/login` - Sign in (returns JWT)
- `POST /api/v1/auth/logout` - Sign out

**Projects**
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Update project
- `GET /api/v1/projects/{id}/financials` - Get revenue/cost/profit

**Tasks**
- `GET /api/v1/projects/{projectId}/tasks` - List tasks
- `POST /api/v1/projects/{projectId}/tasks` - Create task
- `POST /api/v1/tasks/{id}/move` - Move task between states

**Timesheets**
- `POST /api/v1/timesheets` - Submit timesheet
- `GET /api/v1/timesheets` - List timesheets (with filters)
- `PUT /api/v1/timesheets/{id}/approve` - Approve timesheet

**Finance**
- `POST /api/v1/finance/invoices/from-timesheets` - **Key endpoint**: Create invoice from approved timesheets
  \`\`\`json
  {
    "project_id": "proj-123",
    "timesheet_ids": ["ts-1", "ts-2"]
  }
  \`\`\`
- `GET /api/v1/finance/invoices` - List invoices

## RBAC Roles

- **ADMIN** - Full system access
- **PROJECT_MANAGER** - Create/manage projects, tasks, approve timesheets
- **TEAM_MEMBER** - Log timesheets, submit expenses, view assigned tasks
- **FINANCE** - Manage financial documents, create invoices
- **VIEWER** - Read-only access

## Key Features

✓ JWT authentication with refresh tokens  
✓ Role-Based Access Control (RBAC) on every endpoint  
✓ Invoice creation from timesheets with transaction support (no double-invoicing)  
✓ Timesheet approval workflow  
✓ Project financial tracking (revenue, cost, profit)  
✓ Audit logging for compliance  
✓ OpenAPI/Swagger documentation  
✓ Database migrations with Prisma  

## Testing

\`\`\`bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
\`\`\`

## Environment Variables

\`\`\`env
DATABASE_URL          PostgreSQL connection string (required)
JWT_SECRET            JWT signing key (change in production!)
PORT                  Server port (default: 3000)
NODE_ENV              development | production
CORS_ORIGIN           Comma-separated allowed origins
\`\`\`

## Deployment

### Docker

\`\`\`bash
# Build image
docker build -t oneflow-backend:1.0.0 .

# Run container
docker run \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -p 3000:3000 \
  oneflow-backend:1.0.0
\`\`\`

### Health Check

\`\`\`bash
curl http://localhost:3000/api/docs
\`\`\`

## Database Backups

\`\`\`bash
# Backup PostgreSQL
pg_dump oneflow_dev > backup.sql

# Restore
psql oneflow_dev < backup.sql
\`\`\`

## Troubleshooting

**Port 3000 already in use:**
\`\`\`bash
lsof -i :3000
kill -9 <PID>
\`\`\`

**Database connection error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure user/password are correct

**Migrations not running:**
\`\`\`bash
npm run db:migrate:deploy
\`\`\`

**Seed script fails:**
\`\`\`bash
npm run db:seed
\`\`\`

## License

MIT

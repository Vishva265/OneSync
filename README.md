# OneSync MVP — Complete Setup

Unified project management & finance platform: **Plan • Execute • Bill**.

> Complete SaaS-ready application with backend API, database, and React frontend. Deploy in minutes.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Test Credentials](#test-credentials)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start with Docker Compose

### Prerequisites

- Docker & Docker Compose (or Node.js 20 + PostgreSQL 15 + Redis 7 for local dev)

### One Command Setup

\`\`\`bash
# Clone repository (if applicable)
git clone <repo>
cd onesync

# Start all services (backend, frontend, database, redis)
docker-compose up --build

# In another terminal, initialize database
docker exec onesync_backend npm run db:migrate:deploy
docker exec onesync_backend npm run db:seed
\`\`\`

**Done!** Services now running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | React UI |
| **Backend API** | http://localhost:3000 | REST API |
| **Swagger Docs** | http://localhost:3000/api/docs | API documentation |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache |

### Test Credentials

\`\`\`
👤 Admin
   Email:    admin@onesync.local
   Password: admin@123
   Role:     ADMIN (full access)

👨‍💼 Project Manager
   Email:    pm@onesync.local
   Password: pm@123
   Role:     PROJECT_MANAGER

💰 Finance Officer
   Email:    finance@onesync.local
   Password: finance@123
   Role:     FINANCE

👨‍💻 Team Member
   Email:    team@onesync.local
   Password: team@123
   Role:     TEAM_MEMBER
\`\`\`

## 🏗️ Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     OneSync MVP Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React 18 + Vite)          Backend (NestJS)      │
│  ├─ Dashboard                        ├─ Auth Module        │
│  ├─ Projects                         ├─ Projects Module    │
│  ├─ Tasks (Kanban)                   ├─ Tasks Module       │
│  ├─ Timesheets                       ├─ Timesheets Module  │
│  ├─ Finance (Invoice Creation)       ├─ Finance Module     │
│  └─ Role-based UI                    └─ RBAC Guards       │
│                                                              │
│  ──────────────────────────────────────────────────────────│
│                                                              │
│  Data Layer (Prisma ORM)                                   │
│  ├─ PostgreSQL (15+)                                        │
│  ├─ Migrations                                              │
│  └─ Relations & Indexes                                     │
│                                                              │
│  Cache & Queues                                            │
│  └─ Redis (7+)                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS (modular, TypeScript-first)
- **ORM**: Prisma (type-safe, migrations, CLI)
- **Database**: PostgreSQL 15+
- **Auth**: JWT + RBAC
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest

### Frontend
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite (fast, HMR)
- **Styling**: Tailwind CSS v4
- **State**: Zustand (auth) + React Query (server state)
- **Routing**: React Router v6
- **HTTP**: Axios

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL (managed or self-hosted)
- **Cache**: Redis

## ✨ Features

### Core Functionality ✓

- **Authentication**: Email/password signup, JWT tokens, role-based access control
- **Project Management**: Create, view, manage projects with budgets and timelines
- **Task Management**: Kanban board with drag-and-drop, task assignment, priority levels
- **Timesheets**: Log billable/non-billable hours, approval workflow
- **Expenses**: Submit expenses with receipts, approval process
- **Finance**:
  - Create customer invoices from approved timesheets (with database transactions)
  - Snapshot hourly rates & descriptions for audit trail
  - Track revenue, cost, and profit per project
  - Sales Orders, Purchase Orders, Vendor Bills (data models ready)
- **Audit Logging**: Track all critical operations for compliance
- **Dashboard**: KPI widgets (active projects, hours logged, revenue)
- **RBAC**: Admin, Project Manager, Finance, Team Member, Viewer roles

### Data Integrity ✓

- **Double-invoicing prevention** via database transactions
- **Timesheet approval workflow** (Draft → Submitted → Approved/Rejected)
- **Immutable audit logs** for financial documents
- **Foreign key constraints** and normalized schema

## 📁 Project Structure

\`\`\`
onesync/
├── backend/                    # NestJS application
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── timesheets/
│   │   │   ├── finance/       # Invoice creation with transactions
│   │   │   └── ...
│   │   ├── common/            # Shared guards, decorators, strategies
│   │   ├── prisma/            # ORM configuration
│   │   └── main.ts            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Data model
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts            # Seed script with sample data
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── api/              # API client functions
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── docker-compose.yml          # All services in one file
└── README.md                   # This file
\`\`\`

## 🔑 Key Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Sign up new user
- `POST /api/v1/auth/login` - Login (returns JWT)
- `POST /api/v1/auth/logout` - Logout

### Projects
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/{id}` - Get project details
- `GET /api/v1/projects/{id}/financials` - Get revenue/cost/profit

### Timesheets
- `POST /api/v1/timesheets` - Log timesheet
- `GET /api/v1/timesheets` - List timesheets (filters: user, project, status)
- `PUT /api/v1/timesheets/{id}/approve` - Approve timesheet

### Finance (Key Endpoint)
- **`POST /api/v1/finance/invoices/from-timesheets`** ⭐
  - **Purpose**: Create customer invoice from approved timesheets
  - **Features**: Atomic transactions, double-invoicing prevention, rate snapshotting, audit logging
  - **Request**:
    \`\`\`json
    {
      "project_id": "proj-123",
      "timesheet_ids": ["ts-1", "ts-2"]
    }
    \`\`\`
  - **Response**:
    \`\`\`json
    {
      "invoice": {
        "id": "inv-1",
        "number": "INV-1704067200000",
        "status": "DRAFT",
        "totalAmount": 960,
        "createdAt": "2025-01-01T12:00:00Z"
      },
      "invoiceLines": [
        {
          "id": "line-1",
          "description": "Time: Design homepage - design mockups",
          "quantity": 8,
          "unitPrice": 60,
          "amount": 480
        }
      ],
      "timesheetsInvoiced": 2
    }
    \`\`\`

### More Endpoints
See `/api/docs` (Swagger) after starting backend.

## 💻 Local Development (No Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Database migrations
npm run db:migrate:dev

# Seed sample data
npm run db:seed

# Start dev server (hot-reload on src changes)
npm run start:dev
\`\`\`

Backend runs on http://localhost:3000

### Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start dev server (HMR enabled)
npm run dev
\`\`\`

Frontend runs on http://localhost:5173

## 🧪 Testing

### Backend Tests

\`\`\`bash
cd backend

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
\`\`\`

Tests cover:
- Invoice creation with transactions
- Double-invoicing prevention
- Timesheet approval workflow
- Financial calculations (revenue, cost, profit margin)
- RBAC authorization

## 📦 Building for Production

### Backend

\`\`\`bash
cd backend
npm run build
# Output: dist/

# Run production build
npm start
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm run build
# Output: dist/

# Preview production build
npm run preview
\`\`\`

### Docker Images

\`\`\`bash
# Build backend image
docker build -t onesync-backend:1.0.0 ./backend

# Build frontend image
docker build -t onesync-frontend:1.0.0 ./frontend

# Run with Docker
docker run -p 3000:3000 onesync-backend:1.0.0
docker run -p 5173:5173 onesync-frontend:1.0.0
\`\`\`

## 🚢 Deployment

### Vercel (Recommended for Frontend)

\`\`\`bash
# Deploy frontend to Vercel
cd frontend
npm install -g vercel
vercel
\`\`\`

### AWS, GCP, Azure (Backend & Database)

**Option 1: Container-based (ECS, Cloud Run, AKS)**

\`\`\`bash
# Push images to container registry
docker tag onesync-backend:1.0.0 my-registry/onesync-backend:1.0.0
docker push my-registry/onesync-backend:1.0.0

# Deploy with Kubernetes manifests or cloud provider CLI
\`\`\`

**Option 2: VPS (DigitalOcean, Linode, etc.)**

\`\`\`bash
# SSH into VPS
ssh user@vps-ip

# Clone repo, start with docker-compose
git clone <repo>
cd onesync
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Environment Variables (Production)

\`\`\`env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@prod-db:5432/onesync
JWT_SECRET=<strong-random-key>
NODE_ENV=production
CORS_ORIGIN=https://yourapp.com

# Frontend (.env.production)
VITE_API_URL=https://api.yourapp.com
\`\`\`

## 🔍 Database Management

### Viewing Database

\`\`\`bash
# Access Prisma Studio (GUI for database)
cd backend
npm run db:studio
\`\`\`

Opens at http://localhost:5555

### Migrations

\`\`\`bash
# Create a new migration after schema changes
npm run db:migrate:dev

# Apply pending migrations (production)
npm run db:migrate:deploy
\`\`\`

## 📊 Monitoring & Logs

### Backend Logs

\`\`\`bash
docker logs -f onesync_backend
\`\`\`

### Database Logs

\`\`\`bash
docker logs -f onesync_postgres
\`\`\`

### Frontend Logs

\`\`\`bash
docker logs -f onesync_frontend
\`\`\`

## 🐛 Troubleshooting

### Port Already in Use

\`\`\`bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
\`\`\`

### Database Connection Error

\`\`\`bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/onesync_dev

# Test connection
psql postgresql://onesync_user:onesync_pass@localhost:5432/onesync_dev
\`\`\`

### Migrations Not Running

\`\`\`bash
# Reset database (caution: deletes data)
cd backend
npm run db:migrate:dev
# or
npx prisma migrate reset

# Re-seed
npm run db:seed
\`\`\`

### Frontend Can't Connect to Backend

- Verify backend is running: `curl http://localhost:3000/api/docs`
- Check `VITE_API_URL` in frontend `.env`
- Ensure CORS is enabled in backend

### Out of Memory During Build

\`\`\`bash
# Increase Node heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run build
\`\`\`

## 📚 Additional Resources

- **Backend README**: `./backend/README.md`
- **Frontend README**: `./frontend/README.md`
- **Prisma Docs**: https://www.prisma.io/docs
- **NestJS Docs**: https://docs.nestjs.com
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

## 🤝 Support

For issues:
1. Check the troubleshooting section above
2. Review service logs: `docker logs <service-name>`
3. Check environment variables: `echo $DATABASE_URL`
4. Ensure all prerequisites are installed
5. Try rebuilding: `docker-compose down && docker-compose up --build`

## 📄 License

MIT

---

**OneSync MVP** | Built with ❤️ for project management & finance  
Version 1.0.0 | November 2025
#   O d o o I I G N - L o c a l  
 
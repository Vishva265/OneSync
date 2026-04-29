# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the functional and non-functional requirements for OneSync, a unified project management and finance platform that supports both frontend and backend capabilities. This SRS covers the complete system scope including user interactions, business workflows, data models, APIs, and deployment requirements.

### 1.2 Scope
OneSync is a SaaS-ready ERP-style application for organizations that need to plan, execute, track, and bill for projects. It unifies:
- Project management
- Task and timesheet tracking
- Expense submission and approval
- Finance management (sales orders, purchase orders, invoices, vendor bills)
- Audit logging and compliance
- Role-based access control
- Dashboard and analytics

The system consists of:
- A React + Vite frontend
- A NestJS backend with Prisma ORM
- PostgreSQL database
- Redis cache support
- Docker-based deployment and local development

### 1.3 Definitions, Acronyms, and Abbreviations
- SRS: Software Requirements Specification
- ERP: Enterprise Resource Planning
- RBAC: Role-Based Access Control
- JWT: JSON Web Token
- API: Application Programming Interface
- PO: Purchase Order
- SO: Sales Order
- KPI: Key Performance Indicator
- CRUD: Create, Read, Update, Delete

### 1.4 References
- `README.md`
- `IMPLEMENTATION_GUIDE.md`
- `backend/README.md`
- `docker-compose.yml`
- `backend/prisma/schema.prisma`
- `frontend/src/pages`
- `backend/src/modules`

## 2. Overall Description

### 2.1 Product Perspective
OneSync is a standalone web application with separate frontend and backend components. The frontend is a single-page application using React and TypeScript. The backend is a REST API built with NestJS and Prisma, exposing endpoints for authentication, projects, tasks, timesheets, expenses, finance documents, analytics, attachments, and audit logs.

The application is designed for modern cloud deployment and local development using Docker Compose.

### 2.2 Product Functions
The system supports the following primary functions:
- User authentication and session management
- Role-based access control
- Project lifecycle management
- Task creation, assignment, and Kanban-style workflow
- Timesheet submission, review, approval, and invoicing
- Expense submission, approval, reimbursement, and reporting
- Milestone creation, tracking, and invoice generation
- Sales order and purchase order management
- Customer invoice and vendor bill creation
- Financial dashboards and project-level financial analytics
- Audit logging for critical operations
- File attachments and comments to support collaboration

### 2.3 User Classes and Characteristics
- **Admin**: Full access to all system features and settings.
- **Project Manager**: Manages projects, tasks, milestones, approves timesheets and expenses, and can create finance documents.
- **Finance**: Manages financial documents, creates invoices, vendor bills, and performs financial tracking.
- **Team Member**: Logs time, submits expenses, views assigned tasks, and interacts with project resources.
- **Viewer**: Read-only access for monitoring projects, tasks, and finance information.

### 2.4 Operating Environment
- Frontend: Web browser, modern Chromium-based browsers recommended.
- Backend: Node.js 20+.
- Database: PostgreSQL 15+.
- Cache: Redis 7+ (optional but supported).
- Development: Docker, Docker Compose, or native Node/PostgreSQL/Redis installation.

### 2.5 Design and Implementation Constraints
- User authentication is implemented using JWT.
- The backend is built with NestJS and Prisma.
- The frontend uses React, TypeScript, Tailwind CSS, React Router, Zustand, and React Query.
- The data model is defined in `backend/prisma/schema.prisma`.
- API documentation is available via Swagger at `/api/docs`.

### 2.6 User Documentation
- `README.md` — project overview, setup, and architecture.
- `IMPLEMENTATION_GUIDE.md` — scenario-focused implementation details.
- `backend/README.md` — backend setup and API information.

## 3. System Features and Requirements

### 3.1 Authentication and Authorization

#### 3.1.1 Description
The system must provide secure user authentication and role-based authorization.

#### 3.1.2 Functional Requirements
- FR-1: Users can sign up using email and password.
- FR-2: Users can sign in and receive a JWT.
- FR-3: Users can sign out.
- FR-4: The system must enforce RBAC on protected endpoints.
- FR-5: User roles include ADMIN, PROJECT_MANAGER, TEAM_MEMBER, FINANCE, VIEWER.

#### 3.1.3 API Endpoints
- `POST /api/v1/auth/sign-up`
- `POST /api/v1/auth/sign-in`
- `POST /api/v1/auth/logout`

### 3.2 User Management

#### 3.2.1 Description
Users are managed in the system with status, role, and profile data.

#### 3.2.2 Requirements
- FR-6: User record stores email, passwordHash, fullName, role, status, defaultHourlyRate, timezone.
- FR-7: User roles control access to features and pages.
- FR-8: User status may be ACTIVE, INACTIVE, or SUSPENDED.

### 3.3 Project Management

#### 3.3.1 Description
The system manages projects, including scheduling, budgets, and assigned teams.

#### 3.3.2 Functional Requirements
- FR-9: Create new projects with fields: code, name, description, customer, manager, dates, budget, currency, billable flag, hourly rate, type, and status.
- FR-10: Retrieve project lists and details.
- FR-11: Update project data.
- FR-12: Retrieve project financials and overview data.
- FR-13: Manage project team members and roles.

#### 3.3.3 API Endpoints
- `GET /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `GET /api/v1/projects/{id}/financials`
- `GET /api/v1/projects/{id}/overview`
- `POST /api/v1/projects`
- `PUT /api/v1/projects/{id}`

### 3.4 Milestone Management

#### 3.4.1 Description
Projects are supported by milestones that can be completed and invoiced.

#### 3.4.2 Functional Requirements
- FR-14: Add milestones to a project.
- FR-15: Update milestone details.
- FR-16: Mark milestones as done.
- FR-17: Create invoices from completed milestones.
- FR-18: Mark milestone as invoiced.

#### 3.4.3 API Endpoints
- `GET /api/v1/projects/{id}/milestones`
- `POST /api/v1/projects/{id}/milestones`
- `PUT /api/v1/projects/milestones/{milestoneId}`
- `POST /api/v1/projects/milestones/{milestoneId}/mark-done`
- `POST /api/v1/projects/milestones/{milestoneId}/create-invoice`

### 3.5 Task Management

#### 3.5.1 Description
Tasks support project execution using structured states and priorities.

#### 3.5.2 Functional Requirements
- FR-19: Create tasks under a project.
- FR-20: Retrieve tasks by project and task id.
- FR-21: Update task details.
- FR-22: Move tasks between states (NEW, IN_PROGRESS, BLOCKED, DONE).
- FR-23: Retrieve project team members for task assignment.

#### 3.5.3 API Endpoints
- `GET /api/v1/projects/{projectId}/tasks`
- `GET /api/v1/projects/{projectId}/team-members`
- `GET /api/v1/tasks/{id}`
- `POST /api/v1/projects/{projectId}/tasks`
- `PUT /api/v1/tasks/{id}`
- `POST /api/v1/tasks/{id}/move`

### 3.6 Timesheet Management

#### 3.6.1 Description
Users log time on tasks and projects for billing and accountability.

#### 3.6.2 Functional Requirements
- FR-24: Submit timesheets with work date, duration, hourly rate, billable flag, notes, task, and project.
- FR-25: Retrieve timesheet records with optional filtering by user, project, and status.
- FR-26: View timesheet details.
- FR-27: Approve or reject timesheets.
- FR-28: Prevent timesheet editing by unauthorized users after submission or approval.
- FR-29: Support default timesheet list behavior for team members to see own records.

#### 3.6.3 API Endpoints
- `GET /api/v1/timesheets`
- `GET /api/v1/timesheets/{id}`
- `POST /api/v1/timesheets`
- `PUT /api/v1/timesheets/{id}`
- `PUT /api/v1/timesheets/{id}/approve`
- `PUT /api/v1/timesheets/{id}/reject`

### 3.7 Expense Management

#### 3.7.1 Description
The system supports expense submission, approval, rejection, and reimbursement.

#### 3.7.2 Functional Requirements
- FR-30: Submit expenses linked to a project with category, amount, currency, date, notes, receipt URL, billable flag.
- FR-31: Retrieve expense lists with optional filtering by project and status.
- FR-32: Retrieve pending expenses and per-project expense lists.
- FR-33: Approve, reject, and reimburse expenses.
- FR-34: Link expense invoices and audit expense lifecycle.

#### 3.7.3 API Endpoints
- `GET /api/v1/expenses`
- `GET /api/v1/expenses/pending`
- `GET /api/v1/expenses/project/{projectId}`
- `POST /api/v1/expenses`
- `PUT /api/v1/expenses/{id}/approve`
- `PUT /api/v1/expenses/{id}/reject`
- `PUT /api/v1/expenses/{id}/reimburse`

### 3.8 Finance Management

#### 3.8.1 Description
Finance management supports orders, invoices, purchase documents, and vendor billing.

#### 3.8.2 Functional Requirements
- FR-35: Create and view sales orders.
- FR-36: Create invoices from sales orders.
- FR-37: Create and view purchase orders.
- FR-38: Create vendor bills from purchase orders.
- FR-39: Link sales orders and purchase orders to projects.
- FR-40: Retrieve lists of invoices and projects' finance documents.
- FR-41: Create customer invoices from approved timesheets.
- FR-42: Create customer invoices from sales orders.
- FR-43: Create customer invoices from expenses.

#### 3.8.3 API Endpoints
- `GET /api/v1/finance/sales-orders`
- `POST /api/v1/finance/sales-orders`
- `GET /api/v1/finance/sales-orders/{id}`
- `POST /api/v1/finance/sales-orders/{id}/create-invoice`
- `GET /api/v1/finance/purchase-orders`
- `POST /api/v1/finance/purchase-orders`
- `GET /api/v1/finance/purchase-orders/{id}`
- `POST /api/v1/finance/vendor-bills/from-po/{poId}`
- `GET /api/v1/finance/vendor-bills`
- `GET /api/v1/finance/vendor-bills/{id}`
- `GET /api/v1/finance/invoices`
- `POST /api/v1/finance/invoices/from-timesheets`
- `POST /api/v1/finance/invoices/from-so`
- `POST /api/v1/finance/sales-orders/{soId}/link-project/{projectId}`
- `POST /api/v1/finance/purchase-orders/{poId}/link-project/{projectId}`
- `POST /api/v1/finance/invoices/from-expenses`

### 3.9 Audit and Analytics

#### 3.9.1 Description
Audit logging and analytics provide accountability and visibility into system activity.

#### 3.9.2 Functional Requirements
- FR-44: Record audit logs for key actions such as create, update, delete, approve, reject, post, and more.
- FR-45: Provide aggregated analytics for dashboards and KPI metrics.
- FR-46: Allow analytics-based pages to display high-level project and financial metrics.

### 3.10 Attachments and Collaboration

#### 3.10.1 Description
Users can attach files and comments to projects, tasks, invoices, and other entities.

#### 3.10.2 Functional Requirements
- FR-47: Store attachments with metadata including file name, size, MIME type, URL, entity type, and entity id.
- FR-48: Attach files to projects, tasks, timesheets, expenses, invoices, and bills.
- FR-49: Record comments with author, content, entity type, and entity id.

## 4. External Interface Requirements

### 4.1 User Interfaces
The frontend provides the following pages:
- `LoginPage.tsx`
- `SignupPage.tsx`
- `DashboardPage.tsx`
- `DashboardTeamPage.tsx`
- `AnalyticsPage.tsx`
- `ExpensesPage.tsx`
- `ExpenseApprovalsPage.tsx`
- `FinancialDashboard.tsx`
- `FinancePage.tsx`
- `InvoiceFromSoPage.tsx`
- `InvoiceViewPage.tsx`
- `VendorBillFromPoPage.tsx`
- `VendorBillViewPage.tsx`
- `ProjectCreatePage.tsx`
- `ProjectPage.tsx`
- `TasksPage.tsx`
- `TimesheetsPage.tsx`
- `ProfilePage.tsx`
- `SettingsPage.tsx`

The UI supports:
- Role-based navigation and route access
- Project overview and detail views
- Kanban task board
- Timesheet entry forms
- Expense submission and approvals
- Financial reporting and invoice workflows
- User profile and settings

### 4.2 Hardware Interfaces
The system does not depend on special hardware. It requires standard server hardware for the backend and standard client hardware to run a modern browser.

### 4.3 Software Interfaces
- Frontend consumes backend REST API over HTTP(S).
- Backend connects to PostgreSQL via Prisma.
- Backend optionally uses Redis for caching/session support.
- Swagger/OpenAPI documentation is exposed at `/api/docs`.

### 4.4 Communications Interfaces
- HTTP/HTTPS for client-server communication.
- JSON payloads for all requests/responses.
- JWT token sent in `Authorization: Bearer <token>` header.

## 5. Non-Functional Requirements

### 5.1 Performance
- NFR-1: Backend should respond to API requests within a reasonable timeframe (< 500ms under normal load).
- NFR-2: Frontend should render pages quickly and support responsive navigation.

### 5.2 Security
- NFR-3: Authenticate users with JWT tokens.
- NFR-4: Authorize endpoints using RBAC guards.
- NFR-5: Store passwords securely as hashes.
- NFR-6: Protect sensitive endpoints with HTTPS in production.

### 5.3 Reliability
- NFR-7: Data integrity must be preserved using database constraints and transactions for financial document creation.
- NFR-8: Prevent double invoicing and inconsistent financial state.

### 5.4 Usability
- NFR-9: UI should be intuitive and easy to navigate for all roles.
- NFR-10: Dashboard and financial pages should clearly present KPI and financial status.

### 5.5 Maintainability
- NFR-11: Codebase follows modular architecture (NestJS modules, React components).
- NFR-12: Data model and API contracts are documented via Swagger.

### 5.6 Portability
- NFR-13: System supports Docker-based deployment for both backend and frontend.
- NFR-14: Backend and frontend can be run locally without Docker using Node.js.

## 6. System Architecture and Data Model

### 6.1 High-Level Architecture
OneSync architecture consists of:
- React frontend served by Vite/Next
- NestJS backend exposing REST APIs for the frontend
- PostgreSQL database via Prisma
- Optional Redis cache
- Docker Compose for local multi-service orchestration

### 6.2 Data Entities
Key database entities include:
- User
- Project
- ProjectTeamMember
- Task
- Milestone
- Timesheet
- Expense
- Product
- SalesOrder
- PurchaseOrder
- CustomerInvoice
- InvoiceLine
- VendorBill
- BillLine
- Attachment
- Comment
- AuditLog

### 6.3 Relationships
- Projects link to users, tasks, milestones, timesheets, expenses, orders, invoices, bills.
- Tasks belong to projects and may be assigned to users.
- Timesheets belong to users, projects, and optionally tasks.
- Expenses belong to users and projects.
- Invoices can be created from timesheets, sales orders, or expenses.
- Vendor bills can be created from purchase orders.
- Attachments and comments are polymorphic and attach to multiple entity types.

### 6.4 Entity Statuses
- UserStatus: ACTIVE, INACTIVE, SUSPENDED
- ProjectStatus: PLANNING, ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
- ProjectType: FIXED_PRICE, TIME_AND_MATERIALS, RETAINER
- TaskState: NEW, IN_PROGRESS, BLOCKED, DONE
- TaskPriority: LOW, MEDIUM, HIGH, CRITICAL
- TimesheetStatus: DRAFT, SUBMITTED, APPROVED, REJECTED
- ExpenseStatus: DRAFT, SUBMITTED, APPROVED, REJECTED
- DocumentStatus: DRAFT, SUBMITTED, POSTED, PAID, CANCELLED, ARCHIVED
- MilestoneStatus: PENDING, IN_PROGRESS, DONE, CANCELLED

## 7. Functional Scenarios

### 7.1 Project Creation and Management
1. Admin or Project Manager creates a project.
2. Add project metadata and assign a project manager.
3. Track budget, type, timeline, and status.
4. Review project overview and financial summary.

### 7.2 Task Execution
1. Project manager creates tasks for projects.
2. Assign tasks to team members.
3. Move tasks through workflow states.
4. View task progress on Kanban-style pages.

### 7.3 Time Tracking and Billing
1. Team member logs timesheets against projects and tasks.
2. Submit timesheets for approval.
3. Approver reviews and approves or rejects timesheets.
4. Finance or project manager creates invoices from approved timesheets.

### 7.4 Milestone-Based Invoicing
1. Create milestones inside a project.
2. Mark milestones as done when completed.
3. Generate invoices from completed milestones.
4. Track invoiced milestone amounts and project status.

### 7.5 Expense Workflow
1. Team members submit expenses with receipts.
2. Managers review pending expenses.
3. Approve or reject expenses with reason.
4. Finance marks approved expenses as reimbursed.
5. Expense costs reflect in project financials.

### 7.6 Order and Invoice Workflow
1. Finance creates sales orders or purchase orders.
2. Link orders to project records.
3. Generate customer invoices from sales orders.
4. Generate vendor bills from purchase orders.
5. Track invoices and vendor bills by project.

### 7.7 Financial Reporting
1. Project managers and finance users access the financial dashboard.
2. View revenue, cost, profit, budget utilization, and profit margin.
3. Use project financials endpoint to inspect per-project financial details.
4. Generate reports for invoicing, sales, and vendor costs.

## 8. External APIs and Integration Points

### 8.1 Swagger Documentation
- API documentation available at `/api/docs` once backend is running.

### 8.2 Backend Services
- PostgreSQL via `DATABASE_URL`
- Redis for caching and optional session usage
- S3-compatible storage for attachments referenced by `s3Url`

### 8.3 Frontend API Consumption
- Axios-based API clients within `frontend/src/api`
- React Query for server state and caching
- Zustand for authentication state

## 9. Non-functional Constraints and Assumptions

### 9.1 Assumptions
- Users will access the frontend with modern browsers.
- PostgreSQL and Redis are available during deployment.
- JWT secret and database connection strings are configured in environment variables.
- File attachments are stored externally and referenced by URL.
- Finance operations are transactional to protect against inconsistent state.

### 9.2 Constraints
- The application is built on Node.js 20 and modern React.
- Prisma ORM defines the database schema and migrations.
- Backend API uses NestJS decorators and guards for security.
- Frontend routes must enforce role-based access control.

## 10. Appendix

### 10.1 Sample Roles and Credentials
- Admin: `admin@onesync.local` / `admin@123`
- Project Manager: `pm@onesync.local` / `pm@123`
- Finance Officer: `finance@onesync.local` / `finance@123`
- Team Member: `team@onesync.local` / `team@123`

### 10.2 Deployment Notes
- Use `docker-compose up --build` to start frontend, backend, database, and Redis.
- Run `docker exec onesync_backend npm run db:migrate:deploy` and `docker exec onesync_backend npm run db:seed` to initialize data.
- Frontend available at `http://localhost:5173`.
- Backend available at `http://localhost:3000`.
- Swagger docs available at `http://localhost:3000/api/docs`.

### 10.3 Glossary
- **Invoice**: Document issued to a customer for billed work.
- **Vendor Bill**: Document representing purchase costs from vendors.
- **Sales Order**: Customer order record used to generate invoices.
- **Purchase Order**: Vendor order record used to generate bills.
- **Milestone**: Project checkpoint that can be invoiced.
- **Timesheet**: Logged work entry for billing.
- **Expense**: Cost incurred by team members on behalf of a project.
- **Audit Log**: Immutable record of system actions.

# ERP System Implementation Guide

## Overview

This document provides a comprehensive guide to the three ERP scenarios that have been implemented in your OneFlow system.

## 🎯 Implemented Scenarios

### Scenario 1: Fixed-Price Project with Milestone-Based Invoicing
**Business Case**: Brand Website Development - ₹1,00,000

#### Workflow
1. **Create Project** (via Projects Page)
   - Navigate to `/projects`
   - Set type to "FIXED_PRICE"
   - Enter budget: ₹1,00,000

2. **Create Milestones** (via Project Detail Page)
   - Go to project detail → "Milestones" tab
   - Add milestones:
     - Wireframe Approval - ₹25,000
     - Design Approval - ₹35,000
     - Development Complete - ₹30,000
     - Go Live - ₹10,000

3. **Mark Milestones as Done**
   - When milestone is completed, click "Mark Done"
   - Status changes from PENDING → DONE
   - Completion date is automatically recorded

4. **Generate Invoice**
   - Click "Create Invoice" on completed milestone
   - System creates Customer Invoice with:
     - Line item for milestone
     - Linked to project
     - Status: DRAFT
   - Milestone marked as "invoiced"

#### Backend Implementation
- **Files Modified**:
  - `backend/prisma/schema.prisma` - Added Milestone model
  - `backend/src/modules/projects/milestones.service.ts` - NEW service
  - `backend/src/modules/projects/milestones.controller.ts` - NEW controller

- **API Endpoints**:
  ```
  GET    /api/v1/projects/:projectId/milestones
  POST   /api/v1/projects/:projectId/milestones
  PATCH  /api/v1/projects/milestones/:milestoneId
  DELETE /api/v1/projects/milestones/:milestoneId
  POST   /api/v1/projects/milestones/:milestoneId/mark-done
  POST   /api/v1/projects/milestones/:milestoneId/invoice
  ```

#### Frontend Implementation
- **Components**: `frontend/src/components/MilestonesPanel.tsx`
- **Pages**: Enhanced `frontend/src/pages/ProjectPage.tsx`
- **Routes**: Integrated into project detail view
- **Features**:
  - Create/Edit/Delete milestones
  - Visual status badges (PENDING, IN_PROGRESS, DONE)
  - One-click invoice generation
  - Progress tracking

---

### Scenario 2: Vendor Purchase Linked to Project
**Business Case**: Photographer Service - ₹12,000 for Brand Website

#### Workflow
1. **Create Purchase Order**
   - Navigate to Procurement or Finance
   - Create PO for photographer - ₹12,000
   - Link to Brand Website project

2. **Link PO to Project** (Backend Ready)
   - API: `POST /api/v1/finance/purchase-orders/:poId/link-project/:projectId`
   - System updates PO with project reference

3. **Create Vendor Bill**
   - When photographer completes work
   - Create vendor bill from PO
   - Bill automatically linked to project

4. **Track in Project Financials**
   - View project financial breakdown
   - Vendor bills appear in costs
   - Budget utilization updated

#### Backend Implementation
- **Files Modified**:
  - `backend/src/modules/finance/finance.service.ts` - Added linking methods
  - `backend/src/modules/projects/projects.service.ts` - Enhanced getFinancials()

- **API Endpoints**:
  ```
  POST   /api/v1/finance/sales-orders/:soId/link-project/:projectId
  POST   /api/v1/finance/purchase-orders/:poId/link-project/:projectId
  GET    /api/v1/projects/:projectId/financials
  ```

#### Frontend Implementation
- **Pages**: `frontend/src/pages/FinancialDashboard.tsx` - NEW comprehensive dashboard
- **Features**:
  - Complete financial overview
  - Cost breakdown by type (timesheets, expenses, vendor bills)
  - Revenue vs cost visualization
  - Profit margin tracking
  - Budget utilization monitoring

---

### Scenario 3: Team Expense Submission & Approval
**Business Case**: Travel Expense - ₹1,500 for Brand Website

#### Workflow
1. **Submit Expense** (Team Member)
   - Navigate to `/expenses`
   - Select project: Brand Website
   - Enter details:
     - Category: TRAVEL
     - Amount: ₹1,500
     - Description: "Client meeting in Mumbai"
     - Upload receipt (optional)
   - Click "Submit Expense"
   - Status: PENDING

2. **Approve Expense** (Manager)
   - Navigate to `/expenses/approvals`
   - View pending expenses queue
   - Review expense details
   - Options:
     - **Approve**: Marks as APPROVED
     - **Reject**: Enter reason, marks as REJECTED

3. **Reimburse** (Finance Team)
   - Approved expenses appear in queue
   - Click "Mark as Reimbursed"
   - Status: REIMBURSED
   - Expense now included in project costs

4. **Track in Project**
   - View project financials
   - See all expenses in cost breakdown
   - Filter by status (Pending/Approved/Reimbursed/Rejected)

#### Backend Implementation
- **Files Modified**:
  - `backend/prisma/schema.prisma` - Changed Expense.status to enum
  - `backend/src/modules/expenses/expenses.service.ts` - Added workflow methods
  - `backend/src/modules/expenses/expenses.controller.ts` - New endpoints

- **API Endpoints**:
  ```
  POST   /api/v1/expenses
  GET    /api/v1/expenses/pending
  GET    /api/v1/expenses/project/:projectId
  PATCH  /api/v1/expenses/:id/approve
  PATCH  /api/v1/expenses/:id/reject
  PATCH  /api/v1/expenses/:id/reimburse
  ```

#### Frontend Implementation
- **Pages**:
  - `frontend/src/pages/ExpensesPage.tsx` - Employee submission
  - `frontend/src/pages/ExpenseApprovalsPage.tsx` - Manager approvals
- **Routes**:
  - `/expenses` - All users
  - `/expenses/approvals` - Managers/Admins only
- **Features**:
  - Expense submission form with file upload
  - Pending expenses queue for managers
  - Approve/Reject with reason
  - Status tracking (PENDING → APPROVED → REIMBURSED)
  - Project filtering

---

## 🗺️ Navigation Structure

The navigation has been enhanced with role-based access:

### All Users
- Dashboard
- Timesheets
- Projects
- Tasks
- Expenses

### Managers & Admins
- Approvals (Expense approvals queue)
- Financials (Complete financial dashboard)

### Navigation Component
Location: `frontend/src/components/Navbar.tsx`

Features:
- Role-based navigation items
- Active route highlighting
- Responsive design
- Icon-based navigation

---

## 📊 Financial Dashboard

**Route**: `/financials`

**Access**: Admins, Project Managers, Finance Team

### Features

#### 1. Overview Tab
- Total Revenue (from customer invoices)
- Total Cost (timesheets + expenses + vendor bills)
- Profit & Profit Margin
- Sales Order Total
- Visual revenue vs cost comparison
- Document counts (invoices, timesheets, expenses, etc.)

#### 2. Cost Breakdown Tab
- Timesheet costs
- Expense costs
- Vendor bill costs
- Percentage distribution
- Visual progress bars

#### 3. Milestones Tab
- Total milestones
- Completed milestones
- Invoiced milestones
- Pending milestones
- Total milestone value
- Invoiced amount
- Remaining to invoice
- Invoicing progress visualization

#### 4. Budget Tab
- Budget amount
- Budget used (with percentage)
- Budget remaining
- Budget health indicators:
  - ✓ Within budget (< 75%)
  - ⚠️ Approaching limit (75-90%)
  - ⚠️ Almost exhausted (> 90%)
- Planned vs actual revenue
- Expected profit

---

## 🔑 Database Schema

### New Models

#### Milestone
```prisma
model Milestone {
  id            String          @id @default(uuid())
  projectId     String
  project       Project         @relation(fields: [projectId], references: [id])
  name          String
  description   String?
  status        MilestoneStatus @default(PENDING)
  amount        Float
  invoiced      Boolean         @default(false)
  invoiceId     String?         @unique
  invoice       CustomerInvoice? @relation(fields: [invoiceId], references: [id])
  dueDate       DateTime?
  completedDate DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  DONE
  CANCELLED
}
```

### Modified Models

#### Expense
Changed field:
```prisma
// Before
approved Boolean @default(false)

// After
status ExpenseStatus @default(PENDING)

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  REIMBURSED
}
```

---

## 🧪 Testing Workflows

### Test Scenario 1: Complete Milestone-Based Invoicing

1. Create project "Brand Website" with ₹1,00,000 budget
2. Add 4 milestones totaling ₹1,00,000
3. Track team time on project (adds to costs)
4. Mark first milestone as DONE
5. Generate invoice from milestone
6. Check financial dashboard:
   - Revenue: ₹25,000
   - Cost: (timesheet hours × rate)
   - Profit: Revenue - Cost
7. Repeat for remaining milestones
8. Final check: Total invoiced = ₹1,00,000

### Test Scenario 2: Vendor Purchase Flow

1. Create Purchase Order for photographer - ₹12,000
2. Link PO to Brand Website project (via API)
3. Create vendor bill from PO
4. Check project financials:
   - Vendor Bill Cost: ₹12,000
   - Total Cost includes vendor bill
   - Budget utilization updated

### Test Scenario 3: Expense Workflow

1. **As Team Member**:
   - Submit travel expense: ₹1,500
   - Add description and receipt
   - Verify status: PENDING

2. **As Manager**:
   - Go to `/expenses/approvals`
   - See pending expense
   - Click "Approve"
   - Expense status → APPROVED

3. **As Finance**:
   - See approved expense
   - Click "Mark as Reimbursed"
   - Status → REIMBURSED

4. **Verify in Financials**:
   - Go to project financial dashboard
   - See ₹1,500 in expense costs
   - Budget utilization updated

---

## 🚀 Running the Application

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api

---

## 👥 User Roles & Permissions

### ADMIN
- Full access to all features
- Can view all financials
- Can approve expenses
- Can manage all projects

### PROJECT_MANAGER
- Can create/manage projects
- Can create milestones
- Can approve expenses
- Can view financials
- Access to approval queue

### FINANCE
- Can view financial dashboard
- Can reimburse expenses
- Can create invoices and bills

### TEAM_MEMBER
- Can submit timesheets
- Can submit expenses
- Can view assigned tasks
- Limited project visibility

### VIEWER
- Read-only access
- Can view dashboards
- Cannot create/modify data

---

## 📁 Key Files Reference

### Backend Services
- `backend/src/modules/projects/milestones.service.ts` - Milestone management
- `backend/src/modules/expenses/expenses.service.ts` - Expense workflow
- `backend/src/modules/finance/finance.service.ts` - Finance operations
- `backend/src/modules/projects/projects.service.ts` - Project financials

### Frontend Pages
- `frontend/src/pages/ProjectPage.tsx` - Project detail with milestones
- `frontend/src/pages/ExpensesPage.tsx` - Expense submission
- `frontend/src/pages/ExpenseApprovalsPage.tsx` - Manager approvals
- `frontend/src/pages/FinancialDashboard.tsx` - Financial overview

### Frontend Components
- `frontend/src/components/MilestonesPanel.tsx` - Milestone management UI
- `frontend/src/components/Navbar.tsx` - Navigation with role-based access

### API Clients
- `frontend/src/api/projects.ts` - Project & milestone APIs
- `frontend/src/api/expenses.ts` - Expense APIs

---

## 🐛 Common Issues & Solutions

### Issue: Prisma client not recognizing new models
**Solution**:
```bash
cd backend
npx prisma generate
# Restart your IDE/TypeScript server
```

### Issue: TypeScript errors after schema changes
**Solution**:
1. Run `npx prisma generate`
2. Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

### Issue: Expense status field errors
**Solution**: 
The `approved` boolean field has been replaced with `status` enum. Update any old code references.

### Issue: Navigation not showing new routes
**Solution**: 
Check user role - some routes are role-restricted in `Navbar.tsx`

---

## 🔄 Next Steps

### Potential Enhancements

1. **Invoice PDF Generation**
   - Add PDF export for invoices
   - Email invoices to customers

2. **Expense Receipt Management**
   - File upload and storage (S3/local)
   - Receipt preview in approval queue

3. **Advanced Reporting**
   - Project profitability reports
   - Time tracking vs budget analysis
   - Expense trends and analytics

4. **Notifications**
   - Email notifications for expense approvals
   - Milestone due date reminders
   - Budget threshold alerts

5. **Mobile Responsiveness**
   - Optimize for mobile devices
   - Touch-friendly interfaces

6. **Bulk Operations**
   - Bulk expense approvals
   - Batch invoice generation

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review the API endpoints in the controllers
3. Check the console for error messages
4. Verify your user role has appropriate permissions

---

**Last Updated**: December 2024
**Version**: 1.0.0

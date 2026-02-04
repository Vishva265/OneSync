# ERP Scenarios Implementation Guide

This guide explains how to use the three main ERP scenarios implemented in OneFlow.

## Scenario 1: Fixed-Price Project with Milestone-Based Invoicing

**Use Case**: ₹1,00,000 Brand Website project with milestone-based payments

### How to Use:

1. **Create a Project**
   - Navigate to Projects → New Project
   - Set name: "Brand Website Design"
   - Set billing type: "FIXED_PRICE"
   - Set budget: 100000

2. **Add Milestones**
   - Open the project detail page
   - Go to "Milestones" tab
   - Click "New Milestone"
   - Create milestones:
     - "Wireframes Complete" - ₹30,000
     - "Design Mockups Approved" - ₹40,000
     - "Final Delivery & Launch" - ₹30,000

3. **Track Progress**
   - As work progresses, mark milestones as "Done"
   - Click "Mark Done" button on completed milestones

4. **Generate Invoices**
   - After marking a milestone done, click "Create Invoice"
   - System automatically creates a customer invoice
   - Invoice is linked to the milestone
   - Navigate to /financials to see financial overview

### Backend API Endpoints:

```typescript
// Get project milestones
GET /api/v1/projects/:projectId/milestones

// Create milestone
POST /api/v1/projects/:projectId/milestones
Body: { name, description, amount, dueDate }

// Mark milestone done
PUT /api/v1/milestones/:id/done

// Create invoice from milestone
POST /api/v1/milestones/:id/create-invoice
```

---

## Scenario 2: Vendor Purchase Order Linked to Project

**Use Case**: ₹12,000 photography service for the Brand Website project

### How to Use:

1. **Create Purchase Order**
   - Navigate to Purchase Orders
   - Create new PO for photographer
   - Total: 12000
   - Status: CONFIRMED

2. **Link to Project**
   - Open the PO detail page
   - Find "Link to Project" section
   - Select project: "Brand Website Design"
   - Click "Link to Project"

3. **Create Vendor Bill**
   - After service delivery, create vendor bill from PO
   - Bill is automatically linked to project
   - Cost appears in project financials

4. **View in Project Financials**
   - Navigate to project detail page
   - See "Vendor Bills" cost: ₹12,000
   - Total cost includes this vendor expense

### Backend API Endpoints:

```typescript
// Link PO to project
POST /api/v1/finance/purchase-orders/:poId/link-project/:projectId

// Get project financials (includes vendor bills)
GET /api/v1/projects/:projectId/financials

// Create vendor bill from PO
POST /api/v1/vendor-bills/:poId
```

---

## Scenario 3: Team Expense Submission, Approval & Reimbursement

**Use Case**: ₹1,500 travel expense for team member meeting

### How to Use:

#### For Team Members:

1. **Submit Expense**
   - Navigate to /expenses
   - Click "Submit New Expense"
   - Fill in details:
     - Category: "TRAVEL"
     - Amount: 1500
     - Description: "Client meeting travel"
     - Receipt URL: Upload receipt
     - Project: "Brand Website Design" (optional)
   - Click Submit

2. **Track Status**
   - View expense list
   - Status badges: PENDING → APPROVED/REJECTED → REIMBURSED
   - Filter by status and project

#### For Managers:

1. **Review Pending Expenses**
   - Navigate to /expenses/approvals
   - See all pending expenses from team
   - Review amount, category, receipt

2. **Approve/Reject**
   - Click "Approve" to accept
   - Click "Reject" and provide reason
   - Status updates automatically

#### For Finance Team:

1. **Process Reimbursements**
   - Filter expenses by status: APPROVED
   - Click "Reimburse" on approved expenses
   - Marks as REIMBURSED
   - Updates project costs if linked

### Backend API Endpoints:

```typescript
// Submit expense
POST /api/v1/expenses
Body: { category, amount, description, receiptUrl, projectId }

// Get pending approvals (managers)
GET /api/v1/expenses/pending

// Approve expense
PUT /api/v1/expenses/:id/approve

// Reject expense
PUT /api/v1/expenses/:id/reject
Body: { reason }

// Reimburse expense (finance)
PUT /api/v1/expenses/:id/reimburse

// Get project expenses
GET /api/v1/expenses/project/:projectId
```

---

## Financial Dashboard

Navigate to **/financials** to see comprehensive financial overview:

### Features:

1. **Overview Tab**
   - Total Revenue, Cost, Profit
   - Profit Margin %
   - Document counts (invoices, timesheets, expenses, etc.)
   - Revenue vs Cost visualization

2. **Cost Breakdown Tab**
   - Timesheet Cost
   - Expense Cost
   - Vendor Bill Cost
   - Percentage distribution charts

3. **Milestones Tab**
   - Total milestones count
   - Completed vs Pending
   - Invoiced milestones
   - Invoicing progress

4. **Budget Tab**
   - Budget allocation
   - Budget used percentage
   - Budget remaining
   - Budget health indicators

---

## Navigation

The navbar now includes quick links to:

- **Dashboard**: Overview and quick actions
- **Timesheets**: Time tracking
- **Projects**: Project management
- **Tasks**: Task tracking
- **Expenses**: Submit and track expenses
- **Approvals**: (Managers only) Approve/reject expenses
- **Financials**: (Managers/Finance only) Financial dashboard

---

## Role-Based Access

- **TEAM_MEMBER**: Can submit expenses, view own timesheets/tasks
- **PROJECT_MANAGER**: Can approve expenses, view all projects, access financials
- **ADMIN**: Full access to all features
- **FINANCE**: Can reimburse expenses, access financial dashboard
- **VIEWER**: Read-only access

---

## Workflow Summary

### Complete Project Workflow:

1. **Planning Phase**
   - Create project (budget: ₹100,000)
   - Add milestones
   - Create sales order

2. **Execution Phase**
   - Track time with timesheets
   - Purchase vendor services (PO: ₹12,000)
   - Team submits expenses (₹1,500)
   - Manager approves expenses

3. **Billing Phase**
   - Complete milestones
   - Generate invoices from milestones
   - Create vendor bills from POs

4. **Financial Phase**
   - Finance reimburses expenses
   - View complete financial breakdown
   - Calculate profit/loss
   - Monitor budget utilization

### Expected Financial Result:

```
Revenue:        ₹100,000 (from milestone invoices)
Costs:
  - Vendor Bills:  ₹12,000 (photographer)
  - Expenses:      ₹1,500  (travel)
  - Timesheets:    ₹XX,XXX (team hours)
  
Total Cost:     ₹13,500+ 
Profit:         ₹86,500+ (86.5% margin)
```

---

## Database Schema

### Milestone Model

```prisma
model Milestone {
  id            String           @id @default(uuid())
  projectId     String
  project       Project          @relation(fields: [projectId], references: [id])
  name          String
  description   String?
  status        MilestoneStatus  @default(PENDING)
  amount        Decimal          @db.Decimal(15, 2)
  invoiced      Boolean          @default(false)
  invoiceId     String?
  invoice       CustomerInvoice? @relation(fields: [invoiceId], references: [id])
  dueDate       DateTime?
  completedDate DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  DONE
  CANCELLED
}
```

### Updated Expense Model

```prisma
model Expense {
  // ... existing fields
  status        ExpenseStatus    @default(PENDING)
  approvedBy    String?
  approvedAt    DateTime?
  rejectedBy    String?
  rejectedAt    DateTime?
  rejectionReason String?
  reimbursedBy  String?
  reimbursedAt  DateTime?
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  REIMBURSED
}
```

---

## Testing

To test the complete workflow:

1. **Start Backend**: `cd backend && npm run start:dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Login** as PROJECT_MANAGER or ADMIN
4. Follow the scenario workflows above

---

## Troubleshooting

### Issue: Milestones not showing
- Ensure project is created
- Refresh the page
- Check browser console for errors

### Issue: Cannot approve expenses
- Verify user has PROJECT_MANAGER or ADMIN role
- Expense must be in PENDING status

### Issue: Invoice not created from milestone
- Milestone must be marked "DONE" first
- Check that milestone has an amount > 0
- Ensure project has a valid customer

### Issue: Costs not showing in financials
- Ensure expenses are APPROVED or REIMBURSED
- Verify vendor bills are created and confirmed
- Link purchase orders to project

---

## Next Steps

Potential enhancements:

1. **Email Notifications**
   - Notify managers of pending expense approvals
   - Alert team members when expenses are approved/rejected

2. **File Upload**
   - Upload receipt images directly
   - Store in S3 or cloud storage

3. **Budget Alerts**
   - Warn when project exceeds 80% budget
   - Block expense submissions over budget

4. **Reporting**
   - Export financial reports to PDF/Excel
   - Generate profit/loss statements
   - Project profitability analytics

5. **Mobile App**
   - Quick expense submission from mobile
   - Approve expenses on the go

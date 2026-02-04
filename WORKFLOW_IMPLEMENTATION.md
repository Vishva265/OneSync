# ERP Workflow Implementation Guide

This document explains the three concrete scenarios implemented in your ERP system and how to use them.

## Overview

Your ERP system now supports three main workflows:
1. **Fixed-price projects with milestone-based invoicing**
2. **Projects with vendor purchases**
3. **Team expense tracking and reimbursement**

---

## Scenario 8.1: Fixed-Price Project with Milestone Invoicing

### Business Case
You sell a "Brand Website" to a customer for ₹1,00,000 with two milestones:
- Design milestone: ₹40,000
- Build milestone: ₹60,000

### Implementation Flow

#### Step 1: Create Sales Order
```http
POST /api/v1/finance/sales-orders
Content-Type: application/json

{
  "customerName": "Acme Corp",
  "notes": "Brand Website Project",
  "lines": [
    {
      "productName": "Brand Website - Design",
      "quantity": 1,
      "unitPrice": 40000
    },
    {
      "productName": "Brand Website - Build",
      "quantity": 1,
      "unitPrice": 60000
    }
  ]
}
```

Response includes `salesOrderId` (e.g., `so_123`)

#### Step 2: Create Project
```http
POST /api/v1/projects
Content-Type: application/json

{
  "name": "Brand Website",
  "code": "BRAND-WEB-001",
  "description": "Complete brand website for Acme Corp",
  "budgetAmount": 100000,
  "currency": "INR",
  "startDate": "2026-01-28",
  "managerId": "user_xyz",
  "projectType": "FIXED_PRICE",
  "status": "ACTIVE"
}
```

Response includes `projectId` (e.g., `proj_456`)

#### Step 3: Link Sales Order to Project
```http
POST /api/v1/finance/sales-orders/{soId}/link-project/{projectId}
```

Example:
```http
POST /api/v1/finance/sales-orders/so_123/link-project/proj_456
```

#### Step 4: Create Milestones
```http
POST /api/v1/projects/{projectId}/milestones
Content-Type: application/json

{
  "name": "Design Phase",
  "description": "Complete UI/UX design and mockups",
  "amount": 40000,
  "dueDate": "2026-02-15"
}
```

Repeat for Build milestone:
```http
POST /api/v1/projects/{projectId}/milestones
Content-Type: application/json

{
  "name": "Build Phase",
  "description": "Development and deployment",
  "amount": 60000,
  "dueDate": "2026-03-30"
}
```

#### Step 5: Mark Milestone as Done and Create Invoice

When Design phase is complete:
```http
POST /api/v1/projects/milestones/{milestoneId}/mark-done
```

Then create invoice:
```http
POST /api/v1/projects/milestones/{milestoneId}/create-invoice
```

This automatically:
- Creates a Customer Invoice for ₹40,000
- Links it to the project
- Marks the milestone as invoiced
- Creates audit trail

Repeat for Build milestone when complete.

#### Step 6: View Project Financials
```http
GET /api/v1/projects/{projectId}/financials
```

Response shows:
```json
{
  "projectId": "proj_456",
  "projectName": "Brand Website",
  "revenue": 100000,
  "cost": 25000,
  "profit": 75000,
  "profitMargin": 75,
  "milestones": {
    "total": 2,
    "done": 2,
    "invoiced": 2,
    "totalAmount": 100000,
    "invoicedAmount": 100000
  }
}
```

---

## Scenario 8.2: Project with Vendor Purchase

### Business Case
You need to hire a photographer for ₹12,000 for the Brand Website project.

### Implementation Flow

#### Step 1: Create Purchase Order
```http
POST /api/v1/finance/purchase-orders
Content-Type: application/json

{
  "vendorName": "Professional Photography Studio",
  "projectId": "proj_456",
  "lines": [
    {
      "description": "Product photography for website",
      "quantity": 1,
      "unitPrice": 12000
    }
  ]
}
```

This automatically links the PO to the project.

Response includes `purchaseOrderId` (e.g., `po_789`)

#### Step 2: Create Vendor Bill When Work is Done
```http
POST /api/v1/finance/vendor-bills/from-po/{poId}
Content-Type: application/json

{
  "number": "BILL-PHOTO-001",
  "dueDate": "2026-02-15",
  "notes": "Photography services completed"
}
```

This automatically:
- Creates a Vendor Bill for ₹12,000
- Links it to the Purchase Order and Project
- Updates the PO status to POSTED
- Creates audit trail

#### Step 3: View Updated Project Costs
```http
GET /api/v1/projects/{projectId}/financials
```

Response now shows:
```json
{
  "projectId": "proj_456",
  "revenue": 100000,
  "cost": 37000,
  "timesheetCost": 25000,
  "vendorBillCost": 12000,
  "profit": 63000,
  "profitMargin": 63
}
```

---

## Scenario 8.3: Team Expense Management

### Business Case
A developer travels to the client site and incurs an expense of ₹1,500. The expense needs approval and reimbursement.

### Implementation Flow

#### Step 1: Developer Submits Expense
```http
POST /api/v1/expenses
Content-Type: application/json

{
  "userId": "user_dev_001",
  "projectId": "proj_456",
  "amount": 1500,
  "currency": "INR",
  "date": "2026-01-27",
  "category": "Travel",
  "billable": true,
  "receiptUrl": "https://storage.example.com/receipts/receipt_001.jpg",
  "notes": "Client site visit for requirement gathering"
}
```

The expense is created with status `SUBMITTED`.

#### Step 2: Project Manager Reviews Pending Expenses
```http
GET /api/v1/expenses/pending?projectId=proj_456
```

Response:
```json
[
  {
    "id": "exp_001",
    "userId": "user_dev_001",
    "user": {
      "fullName": "John Developer"
    },
    "amount": 1500,
    "category": "Travel",
    "billable": true,
    "status": "SUBMITTED",
    "notes": "Client site visit for requirement gathering",
    "receiptUrl": "https://storage.example.com/receipts/receipt_001.jpg"
  }
]
```

#### Step 3: Approve Expense
```http
PUT /api/v1/expenses/{expenseId}/approve
```

This updates status to `APPROVED` and creates an audit log.

**Alternative: Reject Expense**
```http
PUT /api/v1/expenses/{expenseId}/reject
Content-Type: application/json

{
  "reason": "Receipt not clear, please resubmit"
}
```

#### Step 4: Add to Customer Invoice (Optional, if billable)
```http
POST /api/v1/finance/invoices/from-expenses
Content-Type: application/json

{
  "project_id": "proj_456",
  "expense_ids": ["exp_001"]
}
```

This creates an invoice including the billable expense.

#### Step 5: Reimburse Team Member
```http
PUT /api/v1/expenses/{expenseId}/reimburse
```

This marks the expense as reimbursed and creates an audit log.

#### Step 6: View Updated Project Financials
```http
GET /api/v1/projects/{projectId}/financials
```

Response shows:
```json
{
  "projectId": "proj_456",
  "revenue": 100000,
  "cost": 38500,
  "timesheetCost": 25000,
  "expenseCost": 1500,
  "vendorBillCost": 12000,
  "profit": 61500,
  "profitMargin": 61.5
}
```

---

## Complete Project Overview API

Get a comprehensive view of everything:

```http
GET /api/v1/projects/{projectId}/overview
```

Response includes:
- Project details
- Team members
- Tasks
- Milestones (with status)
- Sales Orders (linked)
- Purchase Orders (linked)
- Customer Invoices
- Vendor Bills
- Timesheets (recent 50)
- Expenses (all)
- Complete financial summary

---

## Database Schema Additions

### New Model: Milestone
```prisma
model Milestone {
  id              String          @id @default(cuid())
  projectId       String
  name            String
  description     String?
  status          MilestoneStatus @default(PENDING) // PENDING, IN_PROGRESS, DONE, CANCELLED
  amount          Decimal         @db.Decimal(15, 2)
  invoiced        Boolean         @default(false)
  invoiceId       String?
  dueDate         DateTime?
  completedDate   DateTime?
}
```

### Updated Expense Model
- Changed `approved: Boolean` to `status: ExpenseStatus`
- Status can be: DRAFT, SUBMITTED, APPROVED, REJECTED

---

## API Endpoints Summary

### Projects
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/{id}` - Get project details
- `GET /api/v1/projects/{id}/financials` - Get financial summary
- `GET /api/v1/projects/{id}/overview` - Get complete overview
- `POST /api/v1/projects` - Create project
- `PUT /api/v1/projects/{id}` - Update project

### Milestones
- `GET /api/v1/projects/{id}/milestones` - List project milestones
- `POST /api/v1/projects/{id}/milestones` - Create milestone
- `PUT /api/v1/projects/milestones/{milestoneId}` - Update milestone
- `POST /api/v1/projects/milestones/{milestoneId}/mark-done` - Mark milestone done
- `POST /api/v1/projects/milestones/{milestoneId}/create-invoice` - Create invoice from milestone

### Sales Orders
- `GET /api/v1/finance/sales-orders` - List sales orders
- `GET /api/v1/finance/sales-orders/{id}` - Get sales order
- `POST /api/v1/finance/sales-orders` - Create sales order
- `POST /api/v1/finance/sales-orders/{soId}/link-project/{projectId}` - Link to project

### Purchase Orders
- `GET /api/v1/finance/purchase-orders` - List purchase orders
- `GET /api/v1/finance/purchase-orders/{id}` - Get purchase order
- `POST /api/v1/finance/purchase-orders` - Create purchase order
- `POST /api/v1/finance/purchase-orders/{poId}/link-project/{projectId}` - Link to project

### Vendor Bills
- `GET /api/v1/finance/vendor-bills` - List vendor bills
- `GET /api/v1/finance/vendor-bills/{id}` - Get vendor bill
- `POST /api/v1/finance/vendor-bills/from-po/{poId}` - Create from PO

### Customer Invoices
- `GET /api/v1/finance/invoices` - List invoices
- `POST /api/v1/finance/invoices/from-timesheets` - Create from timesheets
- `POST /api/v1/finance/invoices/from-expenses` - Create from expenses
- `POST /api/v1/finance/sales-orders/{id}/create-invoice` - Create from SO

### Expenses
- `GET /api/v1/expenses` - List expenses
- `GET /api/v1/expenses/pending` - Get pending approvals
- `GET /api/v1/expenses/project/{projectId}` - Get by project
- `POST /api/v1/expenses` - Create expense
- `PUT /api/v1/expenses/{id}/approve` - Approve expense
- `PUT /api/v1/expenses/{id}/reject` - Reject expense
- `PUT /api/v1/expenses/{id}/reimburse` - Reimburse expense

---

## Best Practices

1. **Always link Sales Orders and Purchase Orders to projects** - This ensures accurate financial tracking

2. **Use milestones for fixed-price projects** - Create milestones before starting work to track progress and billing

3. **Approve expenses promptly** - Unapproved expenses don't show in project costs

4. **Mark expenses as billable when appropriate** - Billable expenses can be added to customer invoices

5. **Monitor project financials regularly** - Use the `/financials` endpoint to track profitability

6. **Complete audit trail** - All major actions (invoice creation, expense approval, etc.) are logged in AuditLog

---

## What's Been Implemented

✅ Milestone-based project invoicing
✅ Sales Order to Project linking
✅ Purchase Order to Project linking
✅ Vendor Bill creation from PO
✅ Expense submission and approval workflow
✅ Expense reimbursement tracking
✅ Billable expense to invoice conversion
✅ Comprehensive project financial tracking
✅ Complete audit trail
✅ API endpoints for all workflows

---

## Next Steps for Frontend Integration

1. **Project Creation Form** - Add milestone creation during project setup
2. **Milestone Dashboard** - Show milestone progress and invoice status
3. **Expense Submission Form** - Allow team members to submit expenses with receipt upload
4. **Expense Approval Queue** - For project managers to review and approve expenses
5. **Financial Overview Dashboard** - Display comprehensive project financials with charts
6. **Sales/Purchase Order Linking UI** - Easy interface to link documents to projects

All the backend logic is ready - you just need to create the UI components to interact with these APIs!

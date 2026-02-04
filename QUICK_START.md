# 🚀 Quick Start Guide - ERP Features

## Routes Overview

| Route | Access | Purpose |
|-------|--------|---------|
| `/projects` | All | View and manage projects |
| `/projects/:id` | All | Project details with milestones tab |
| `/expenses` | All | Submit and view expenses |
| `/expenses/approvals` | Manager/Admin | Approve/reject team expenses |
| `/financials` | Manager/Admin/Finance | Complete financial dashboard |

## Feature Quick Access

### 1️⃣ Milestone-Based Invoicing
1. Go to project → "Milestones" tab
2. Click "Add Milestone"
3. Enter: Name, Amount, Due Date
4. When done: "Mark Done" → "Create Invoice"

### 2️⃣ Submit Expense
1. Navigate to `/expenses`
2. Click "Submit New Expense"
3. Fill: Project, Category, Amount, Description
4. Upload receipt (optional)
5. Submit → Status: PENDING

### 3️⃣ Approve Expenses (Managers)
1. Navigate to `/expenses/approvals`
2. Review pending expenses
3. Click "Approve" or "Reject"
4. Add reason if rejecting

### 4️⃣ View Financial Dashboard
1. Navigate to `/financials`
2. Select project from dropdown
3. View tabs:
   - **Overview**: Revenue, cost, profit
   - **Costs**: Breakdown by type
   - **Milestones**: Progress & invoicing
   - **Budget**: Utilization & health

## API Endpoints Quick Reference

### Milestones
```
GET    /api/v1/projects/:projectId/milestones
POST   /api/v1/projects/:projectId/milestones
POST   /api/v1/projects/milestones/:id/mark-done
POST   /api/v1/projects/milestones/:id/invoice
```

### Expenses
```
POST   /api/v1/expenses
GET    /api/v1/expenses/pending
PATCH  /api/v1/expenses/:id/approve
PATCH  /api/v1/expenses/:id/reject
PATCH  /api/v1/expenses/:id/reimburse
```

### Financials
```
GET    /api/v1/projects/:projectId/financials
POST   /api/v1/finance/purchase-orders/:poId/link-project/:projectId
```

## Database Quick Reference

### Milestone Status Flow
```
PENDING → IN_PROGRESS → DONE → Invoice Generated
                     ↓
                 CANCELLED
```

### Expense Status Flow
```
PENDING → APPROVED → REIMBURSED
       ↓
    REJECTED
```

## Component Locations

| Component | File |
|-----------|------|
| Milestones Panel | `frontend/src/components/MilestonesPanel.tsx` |
| Expenses Page | `frontend/src/pages/ExpensesPage.tsx` |
| Expense Approvals | `frontend/src/pages/ExpenseApprovalsPage.tsx` |
| Financial Dashboard | `frontend/src/pages/FinancialDashboard.tsx` |
| Navigation | `frontend/src/components/Navbar.tsx` |

## Testing Checklist

- [ ] Create project with milestones
- [ ] Mark milestone as done
- [ ] Generate invoice from milestone
- [ ] Submit expense as team member
- [ ] Approve expense as manager
- [ ] Reimburse expense as finance
- [ ] View project financials
- [ ] Check budget utilization
- [ ] Verify cost breakdown
- [ ] Test all navigation links

## Role Permissions

| Feature | Team Member | Manager | Finance | Admin |
|---------|------------|---------|---------|-------|
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create Milestones | ❌ | ✅ | ❌ | ✅ |
| Submit Expenses | ✅ | ✅ | ✅ | ✅ |
| Approve Expenses | ❌ | ✅ | ❌ | ✅ |
| Reimburse Expenses | ❌ | ❌ | ✅ | ✅ |
| View Financials | ❌ | ✅ | ✅ | ✅ |
| Generate Invoices | ❌ | ✅ | ✅ | ✅ |

---

**For detailed information, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**

# Visual Workflow Diagrams

## Scenario 8.1: Fixed-Price Project Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIXED-PRICE PROJECT                          │
│                   (Brand Website - ₹1,00,000)                   │
└─────────────────────────────────────────────────────────────────┘

Step 1: SALES & PROJECT SETUP
┌──────────────────┐         ┌──────────────────┐
│  Sales Order     │ ──────> │    Project       │
│  ₹1,00,000      │  Link   │  Brand Website   │
└──────────────────┘         └──────────────────┘

Step 2: CREATE MILESTONES
                    ┌──────────────────┐
                    │    Milestones    │
                    ├──────────────────┤
                    │ Design   ₹40k    │
                    │ Build    ₹60k    │
                    └──────────────────┘

Step 3: COMPLETE DESIGN MILESTONE
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Design Phase    │ ──────> │   Mark DONE      │ ──────> │ Customer Invoice │
│  Status: DONE    │         │                  │         │    ₹40,000       │
└──────────────────┘         └──────────────────┘         └──────────────────┘

Step 4: COMPLETE BUILD MILESTONE
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Build Phase     │ ──────> │   Mark DONE      │ ──────> │ Customer Invoice │
│  Status: DONE    │         │                  │         │    ₹60,000       │
└──────────────────┘         └──────────────────┘         └──────────────────┘

FINAL PROJECT OVERVIEW
┌────────────────────────────────────────────────────────┐
│  Revenue:        ₹1,00,000  (2 invoices)              │
│  Cost:           ₹25,000    (timesheets + expenses)   │
│  Profit:         ₹75,000                              │
│  Profit Margin:  75%                                  │
│  Milestones:     2/2 Done, 2/2 Invoiced               │
└────────────────────────────────────────────────────────┘
```

## Scenario 8.2: Vendor Purchase Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               PROJECT NEEDS VENDOR SERVICE                      │
│           (Photographer for Brand Website)                      │
└─────────────────────────────────────────────────────────────────┘

Step 1: CREATE PURCHASE ORDER
┌──────────────────┐         ┌──────────────────┐
│  Project         │ <────── │ Purchase Order   │
│  Brand Website   │  Linked │ Photography ₹12k │
└──────────────────┘         └──────────────────┘

Step 2: VENDOR COMPLETES WORK
┌──────────────────┐         ┌──────────────────┐
│ Purchase Order   │ ──────> │  Vendor Bill     │
│  ₹12,000        │  Create │   ₹12,000        │
└──────────────────┘         └──────────────────┘

Step 3: COSTS UPDATE AUTOMATICALLY
┌────────────────────────────────────────────────────────┐
│  PROJECT FINANCIALS (Updated)                          │
│                                                         │
│  Revenue:         ₹1,00,000                            │
│  Costs:           ₹37,000                              │
│    - Timesheets:  ₹25,000                              │
│    - Vendor:      ₹12,000  ← NEW                       │
│  Profit:          ₹63,000                              │
│  Profit Margin:   63%                                  │
└────────────────────────────────────────────────────────┘
```

## Scenario 8.3: Expense Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  TEAM MEMBER EXPENSE                            │
│              (Developer Travel - ₹1,500)                        │
└─────────────────────────────────────────────────────────────────┘

Step 1: DEVELOPER SUBMITS EXPENSE
┌──────────────────┐
│   Developer      │
│   Submits        │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│   Expense        │
│   ₹1,500        │
│   Status:        │
│   SUBMITTED      │
│   With Receipt   │
└──────────────────┘

Step 2: PROJECT MANAGER REVIEWS
┌──────────────────┐         ┌──────────────────┐
│ Pending Queue    │         │ Project Manager  │
│                  │ ──────> │   Reviews        │
│ • Expense ₹1.5k  │         │   Receipt        │
└──────────────────┘         └─────────┬────────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                          v                         v
                    ┌──────────┐            ┌──────────┐
                    │ APPROVE  │            │ REJECT   │
                    └──────────┘            └──────────┘

Step 3: APPROVED - TWO PATHS

Path A: Non-Billable                    Path B: Billable
┌──────────────────┐                    ┌──────────────────┐
│   Expense        │                    │   Expense        │
│   Status:        │                    │   Billable: true │
│   APPROVED       │                    └────────┬─────────┘
└────────┬─────────┘                             │
         │                                       v
         v                              ┌──────────────────┐
┌──────────────────┐                    │ Add to Customer  │
│   Reimburse      │                    │    Invoice       │
│   Developer      │                    │   ₹1,500        │
└──────────────────┘                    └────────┬─────────┘
                                                 │
                                                 v
                                        ┌──────────────────┐
                                        │   Reimburse      │
                                        │   Developer      │
                                        └──────────────────┘

Step 4: COSTS UPDATE
┌────────────────────────────────────────────────────────┐
│  PROJECT FINANCIALS (Updated)                          │
│                                                         │
│  Revenue:         ₹1,00,000 (or ₹1,01,500 if billed)  │
│  Costs:           ₹38,500                              │
│    - Timesheets:  ₹25,000                              │
│    - Vendor:      ₹12,000                              │
│    - Expenses:    ₹1,500   ← NEW                       │
│  Profit:          ₹61,500 (or ₹63,000 if billed)      │
└────────────────────────────────────────────────────────┘
```

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ Milestone  │  │  Expense   │  │ Financial  │                │
│  │    UI      │  │  Approval  │  │ Dashboard  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API Calls
                          v
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ Milestones │  │  Expenses  │  │  Finance   │                │
│  │  Service   │  │  Service   │  │  Service   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Projects  │  │   Audit    │  │   Auth     │                │
│  │  Service   │  │   Logs     │  │  Guards    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Prisma ORM
                          v
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Projects │  │Milestones│  │ Expenses │  │  Sales   │       │
│  └──────────┘  └──────────┘  └──────────┘  │  Orders  │       │
│                                             └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Purchase │  │  Vendor  │  │ Customer │  │  Audit   │       │
│  │  Orders  │  │  Bills   │  │ Invoices │  │   Logs   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: From Expense to Profit

```
Developer Travel (₹1,500)
         │
         v
┌─────────────────┐
│ CREATE EXPENSE  │ ← Developer submits with receipt
│ Status: SUBMIT  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ APPROVE EXPENSE │ ← Manager approves
│ Status: APPROVE │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         v                     v
   ┌──────────┐         ┌─────────────┐
   │ Project  │         │ Invoice     │ ← If billable
   │ Cost +   │         │ Line Item   │
   │ ₹1,500   │         │ +₹1,500     │
   └────┬─────┘         └──────┬──────┘
        │                      │
        v                      v
   ┌──────────┐         ┌─────────────┐
   │ Profit   │         │ Revenue +   │
   │ Update   │         │ ₹1,500      │
   └──────────┘         └─────────────┘
         │                     │
         └──────────┬──────────┘
                    v
            ┌───────────────┐
            │ NEW PROFIT =  │
            │ Revenue - Cost│
            └───────────────┘
```

## API Request Flow Example

```
USER ACTION: "Mark Design Milestone as Done and Invoice"

1. Frontend Call:
   POST /api/v1/projects/milestones/{id}/create-invoice

2. Backend (MilestonesService):
   ┌─────────────────────────────────────┐
   │ START TRANSACTION                   │
   ├─────────────────────────────────────┤
   │ 1. Check milestone exists           │
   │ 2. Verify status = DONE             │
   │ 3. Verify not already invoiced      │
   │ 4. Create Customer Invoice          │
   │ 5. Create Invoice Line              │
   │ 6. Mark milestone as invoiced       │
   │ 7. Create Audit Log                 │
   │ COMMIT TRANSACTION                  │
   └─────────────────────────────────────┘

3. Database Updates:
   ┌─────────────────────────────────────┐
   │ CustomerInvoice:                    │
   │   - number: "INV-1234567890"        │
   │   - totalAmount: 40000              │
   │   - status: DRAFT                   │
   │                                     │
   │ Milestone:                          │
   │   - invoiced: true                  │
   │   - invoiceId: "inv_123"            │
   │                                     │
   │ AuditLog:                           │
   │   - action: INVOICE_CREATED         │
   │   - entityType: MILESTONE           │
   └─────────────────────────────────────┘

4. Response to Frontend:
   {
     "invoice": { ... },
     "milestone": { ... }
   }
```

---

These diagrams show how all the pieces work together in your ERP system!

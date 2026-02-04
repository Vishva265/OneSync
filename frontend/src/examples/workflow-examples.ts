/**
 * Example API usage for the three ERP scenarios
 * This shows how to integrate the backend APIs into your frontend
 */

import { apiClient } from '@/api/client';

// ============================================================================
// SCENARIO 8.1: Fixed-Price Project with Milestones
// ============================================================================

export async function createFixedPriceProject() {
  try {
    // Step 1: Create Sales Order
    const salesOrder = await apiClient.post('/api/v1/finance/sales-orders', {
      customerName: 'Acme Corp',
      notes: 'Brand Website Project',
      lines: [
        {
          productName: 'Brand Website - Design',
          quantity: 1,
          unitPrice: 40000,
        },
        {
          productName: 'Brand Website - Build',
          quantity: 1,
          unitPrice: 60000,
        },
      ],
    });

    // Step 2: Create Project
    const project = await apiClient.post('/api/v1/projects', {
      name: 'Brand Website',
      code: 'BRAND-WEB-001',
      description: 'Complete brand website for Acme Corp',
      budgetAmount: 100000,
      currency: 'INR',
      startDate: new Date().toISOString(),
      managerId: 'user_xyz', // Replace with actual manager ID
      projectType: 'FIXED_PRICE',
      status: 'ACTIVE',
    });

    // Step 3: Link Sales Order to Project
    await apiClient.post(
      `/api/v1/finance/sales-orders/${salesOrder.data.id}/link-project/${project.data.id}`
    );

    // Step 4: Create Milestones
    const designMilestone = await apiClient.post(
      `/api/v1/projects/${project.data.id}/milestones`,
      {
        name: 'Design Phase',
        description: 'Complete UI/UX design and mockups',
        amount: 40000,
        dueDate: new Date('2026-02-15').toISOString(),
      }
    );

    const buildMilestone = await apiClient.post(
      `/api/v1/projects/${project.data.id}/milestones`,
      {
        name: 'Build Phase',
        description: 'Development and deployment',
        amount: 60000,
        dueDate: new Date('2026-03-30').toISOString(),
      }
    );

    console.log('Fixed-price project created successfully!');
    return { project, salesOrder, milestones: [designMilestone, buildMilestone] };
  } catch (error) {
    console.error('Error creating fixed-price project:', error);
    throw error;
  }
}

export async function completeMilestoneAndInvoice(milestoneId: string) {
  try {
    // Mark milestone as done
    await apiClient.post(`/api/v1/projects/milestones/${milestoneId}/mark-done`);

    // Create invoice from milestone
    const invoice = await apiClient.post(
      `/api/v1/projects/milestones/${milestoneId}/create-invoice`
    );

    console.log('Milestone completed and invoice created:', invoice.data);
    return invoice.data;
  } catch (error) {
    console.error('Error completing milestone:', error);
    throw error;
  }
}

// ============================================================================
// SCENARIO 8.2: Project with Vendor Purchase
// ============================================================================

export async function createPurchaseOrderForProject(projectId: string) {
  try {
    // Create Purchase Order for vendor
    const purchaseOrder = await apiClient.post('/api/v1/finance/purchase-orders', {
      vendorName: 'Professional Photography Studio',
      projectId: projectId,
      lines: [
        {
          description: 'Product photography for website',
          quantity: 1,
          unitPrice: 12000,
        },
      ],
    });

    console.log('Purchase Order created:', purchaseOrder.data);
    return purchaseOrder.data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
}

export async function createVendorBillFromPO(purchaseOrderId: string) {
  try {
    // Create Vendor Bill from Purchase Order
    const vendorBill = await apiClient.post(
      `/api/v1/finance/vendor-bills/from-po/${purchaseOrderId}`,
      {
        number: `BILL-${Date.now()}`,
        dueDate: new Date('2026-02-15').toISOString(),
        notes: 'Photography services completed',
      }
    );

    console.log('Vendor Bill created:', vendorBill.data);
    return vendorBill.data;
  } catch (error) {
    console.error('Error creating vendor bill:', error);
    throw error;
  }
}

// ============================================================================
// SCENARIO 8.3: Team Expense Management
// ============================================================================

export async function submitExpense(userId: string, projectId: string) {
  try {
    const expense = await apiClient.post('/api/v1/expenses', {
      userId: userId,
      projectId: projectId,
      amount: 1500,
      currency: 'INR',
      date: new Date().toISOString(),
      category: 'Travel',
      billable: true,
      receiptUrl: 'https://storage.example.com/receipts/receipt_001.jpg',
      notes: 'Client site visit for requirement gathering',
    });

    console.log('Expense submitted:', expense.data);
    return expense.data;
  } catch (error) {
    console.error('Error submitting expense:', error);
    throw error;
  }
}

export async function getPendingExpenses(projectId?: string) {
  try {
    const url = projectId
      ? `/api/v1/expenses/pending?projectId=${projectId}`
      : '/api/v1/expenses/pending';
    
    const expenses = await apiClient.get(url);
    return expenses.data;
  } catch (error) {
    console.error('Error fetching pending expenses:', error);
    throw error;
  }
}

export async function approveExpense(expenseId: string) {
  try {
    const result = await apiClient.put(`/api/v1/expenses/${expenseId}/approve`);
    console.log('Expense approved:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error approving expense:', error);
    throw error;
  }
}

export async function rejectExpense(expenseId: string, reason: string) {
  try {
    const result = await apiClient.put(`/api/v1/expenses/${expenseId}/reject`, {
      reason,
    });
    console.log('Expense rejected:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error rejecting expense:', error);
    throw error;
  }
}

export async function reimburseExpense(expenseId: string) {
  try {
    const result = await apiClient.put(`/api/v1/expenses/${expenseId}/reimburse`);
    console.log('Expense reimbursed:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error reimbursing expense:', error);
    throw error;
  }
}

export async function createInvoiceFromExpenses(projectId: string, expenseIds: string[]) {
  try {
    const invoice = await apiClient.post('/api/v1/finance/invoices/from-expenses', {
      project_id: projectId,
      expense_ids: expenseIds,
    });

    console.log('Invoice created from expenses:', invoice.data);
    return invoice.data;
  } catch (error) {
    console.error('Error creating invoice from expenses:', error);
    throw error;
  }
}

// ============================================================================
// Project Financial Overview
// ============================================================================

export async function getProjectFinancials(projectId: string) {
  try {
    const financials = await apiClient.get(`/api/v1/projects/${projectId}/financials`);
    return financials.data;
  } catch (error) {
    console.error('Error fetching project financials:', error);
    throw error;
  }
}

export async function getProjectOverview(projectId: string) {
  try {
    const overview = await apiClient.get(`/api/v1/projects/${projectId}/overview`);
    return overview.data;
  } catch (error) {
    console.error('Error fetching project overview:', error);
    throw error;
  }
}

// ============================================================================
// Complete Example Workflow
// ============================================================================

export async function runCompleteWorkflow() {
  console.log('=== Starting Complete ERP Workflow ===\n');

  // SCENARIO 1: Create fixed-price project
  console.log('SCENARIO 1: Creating fixed-price project...');
  const { project } = await createFixedPriceProject();
  const projectId = project.data.id;

  // Get milestones
  const milestones = await apiClient.get(`/api/v1/projects/${projectId}/milestones`);
  const firstMilestone = milestones.data[0];

  // Complete first milestone and create invoice
  console.log('\nCompleting first milestone...');
  await completeMilestoneAndInvoice(firstMilestone.id);

  // SCENARIO 2: Add vendor purchase
  console.log('\nSCENARIO 2: Creating vendor purchase...');
  const po = await createPurchaseOrderForProject(projectId);
  
  // Create vendor bill
  console.log('\nCreating vendor bill...');
  await createVendorBillFromPO(po.id);

  // SCENARIO 3: Handle team expense
  console.log('\nSCENARIO 3: Handling team expense...');
  const userId = 'user_dev_001'; // Replace with actual user ID
  const expense = await submitExpense(userId, projectId);

  // Approve and reimburse expense
  console.log('\nApproving expense...');
  await approveExpense(expense.id);

  console.log('\nReimbursing expense...');
  await reimburseExpense(expense.id);

  // Get final project financials
  console.log('\nFetching final project financials...');
  const financials = await getProjectFinancials(projectId);
  
  console.log('\n=== Project Financial Summary ===');
  console.log(`Revenue: ₹${financials.revenue.toLocaleString()}`);
  console.log(`Total Cost: ₹${financials.cost.toLocaleString()}`);
  console.log(`  - Timesheet Cost: ₹${financials.timesheetCost.toLocaleString()}`);
  console.log(`  - Expense Cost: ₹${financials.expenseCost.toLocaleString()}`);
  console.log(`  - Vendor Bill Cost: ₹${financials.vendorBillCost.toLocaleString()}`);
  console.log(`Profit: ₹${financials.profit.toLocaleString()}`);
  console.log(`Profit Margin: ${financials.profitMargin.toFixed(2)}%`);

  console.log('\n=== Workflow Complete ===');
  return { projectId, financials };
}

// ============================================================================
// TypeScript Interfaces (for type safety)
// ============================================================================

export interface CreateSalesOrderRequest {
  customerName: string;
  notes?: string;
  lines: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface CreateProjectRequest {
  name: string;
  code?: string;
  description?: string;
  budgetAmount: number;
  currency?: string;
  startDate: string;
  managerId: string;
  projectType?: 'FIXED_PRICE' | 'TIME_AND_MATERIALS' | 'RETAINER';
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
}

export interface CreateMilestoneRequest {
  name: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface CreateExpenseRequest {
  userId: string;
  projectId: string;
  amount: number;
  currency?: string;
  date: string;
  category: string;
  billable?: boolean;
  receiptUrl?: string;
  notes?: string;
}

export interface ProjectFinancials {
  projectId: string;
  projectName: string;
  projectCode: string;
  currency: string;
  revenue: number;
  salesOrderTotal: number;
  cost: number;
  timesheetCost: number;
  expenseCost: number;
  vendorBillCost: number;
  purchaseOrderTotal: number;
  profit: number;
  profitMargin: number;
  budgetAmount: number;
  budgetUsed: number;
  budgetRemaining: number;
  milestones: {
    total: number;
    done: number;
    invoiced: number;
    totalAmount: number;
    invoicedAmount: number;
  };
  counts: {
    invoices: number;
    timesheets: number;
    expenses: number;
    vendorBills: number;
    salesOrders: number;
    purchaseOrders: number;
  };
}

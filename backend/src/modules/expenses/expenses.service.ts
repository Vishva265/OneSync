import { Injectable, BadRequestException } from "@nestjs/common"
import  { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an expense (Scenario 8.3)
   */
  async create(data: {
    userId: string;
    projectId: string;
    amount: number;
    currency?: string;
    date: Date | string;
    category: string;
    billable?: boolean;
    receiptUrl?: string;
    notes?: string;
  }) {
    return this.prisma.expense.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        amount: data.amount,
        currency: data.currency || 'USD',
        date: new Date(data.date),
        category: data.category,
        billable: data.billable || false,
        status: 'SUBMITTED',
        reimbursed: false,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
      },
    });
  }

  async findAll(filters?: any) {
    return this.prisma.expense.findMany({
      where: filters,
      include: { user: true, project: true },
    });
  }

  /**
   * Approve expense (Scenario 8.3 - Project Manager approves)
   */
  async approve(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new BadRequestException('Expense not found');
    }

    if (expense.status === 'APPROVED') {
      throw new BadRequestException('Expense already approved');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'EXPENSE_APPROVED',
          entityType: 'EXPENSE',
          entityId: id,
          details: `Expense approved for amount ${expense.amount}`,
        },
      });

      return updated;
    });
  }

  /**
   * Reject expense
   */
  async reject(id: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      await tx.auditLog.create({
        data: {
          action: 'EXPENSE_REJECTED',
          entityType: 'EXPENSE',
          entityId: id,
          details: reason || 'Expense rejected',
        },
      });

      return updated;
    });
  }

  /**
   * Reimburse expense (Scenario 8.3 - Reimburse team member)
   */
  async reimburse(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new BadRequestException('Expense not found');
    }

    if (expense.status !== 'APPROVED') {
      throw new BadRequestException('Expense must be approved before reimbursement');
    }

    if (expense.reimbursed) {
      throw new BadRequestException('Expense already reimbursed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: { reimbursed: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'EXPENSE_REIMBURSED',
          entityType: 'EXPENSE',
          entityId: id,
          details: `Expense reimbursed for amount ${expense.amount}`,
        },
      });

      return updated;
    });
  }

  /**
   * Get expenses by project
   */
  async getByProject(projectId: string) {
    return this.prisma.expense.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get pending expenses (for approval)
   */
  async getPendingExpenses(projectId?: string) {
    return this.prisma.expense.findMany({
      where: {
        status: 'SUBMITTED',
        ...(projectId ? { projectId } : {}),
      },
      include: { user: true, project: true },
      orderBy: { date: 'desc' },
    });
  }
}

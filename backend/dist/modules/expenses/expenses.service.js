"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create an expense (Scenario 8.3)
     */
    async create(data) {
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
    async findAll(filters) {
        return this.prisma.expense.findMany({
            where: filters,
            include: { user: true, project: true },
        });
    }
    /**
     * Approve expense (Scenario 8.3 - Project Manager approves)
     */
    async approve(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
        });
        if (!expense) {
            throw new common_1.BadRequestException('Expense not found');
        }
        if (expense.status === 'APPROVED') {
            throw new common_1.BadRequestException('Expense already approved');
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
    async reject(id, reason) {
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
    async reimburse(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
        });
        if (!expense) {
            throw new common_1.BadRequestException('Expense not found');
        }
        if (expense.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Expense must be approved before reimbursement');
        }
        if (expense.reimbursed) {
            throw new common_1.BadRequestException('Expense already reimbursed');
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
    async getByProject(projectId) {
        return this.prisma.expense.findMany({
            where: { projectId },
            include: { user: true },
            orderBy: { date: 'desc' },
        });
    }
    /**
     * Get pending expenses (for approval)
     */
    async getPendingExpenses(projectId) {
        return this.prisma.expense.findMany({
            where: {
                status: 'SUBMITTED',
                ...(projectId ? { projectId } : {}),
            },
            include: { user: true, project: true },
            orderBy: { date: 'desc' },
        });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map
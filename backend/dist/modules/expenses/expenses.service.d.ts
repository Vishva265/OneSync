import { PrismaService } from "@/prisma/prisma.service";
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Create an expense (Scenario 8.3)
     */
    create(data: {
        userId: string;
        projectId: string;
        amount: number;
        currency?: string;
        date: Date | string;
        category: string;
        billable?: boolean;
        receiptUrl?: string;
        notes?: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    }>;
    findAll(filters?: any): Promise<({
        user: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    })[]>;
    /**
     * Approve expense (Scenario 8.3 - Project Manager approves)
     */
    approve(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    }>;
    /**
     * Reject expense
     */
    reject(id: string, reason?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    }>;
    /**
     * Reimburse expense (Scenario 8.3 - Reimburse team member)
     */
    reimburse(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    }>;
    /**
     * Get expenses by project
     */
    getByProject(projectId: string): Promise<({
        user: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    })[]>;
    /**
     * Get pending expenses (for approval)
     */
    getPendingExpenses(projectId?: string): Promise<({
        user: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        projectId: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        billable: boolean;
        date: Date;
        category: string;
        reimbursed: boolean;
        receiptUrl: string | null;
    })[]>;
}
//# sourceMappingURL=expenses.service.d.ts.map
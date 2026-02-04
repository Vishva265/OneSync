import { PrismaService } from "@/prisma/prisma.service";
type CreateProjectDto = {
    name: string;
    code?: string;
    description?: string;
    budgetAmount?: number | string;
    currency?: string;
    status?: string;
    startDate?: string | Date;
    dueDate?: string | Date;
    managerId?: string;
    [key: string]: any;
};
type UpdateProjectDto = CreateProjectDto;
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProjectMetrics(): Promise<{
        totalProjects: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
    }>;
    getUtilizationTrend(): Promise<Array<{
        month: string;
        utilization: number;
    }>>;
    findAll(filters?: any): Promise<({
        projectManager: {
            email: string;
            fullName: string;
            id: string;
        };
        teamMembers: {
            user: {
                email: string;
                fullName: string;
            };
            id: string;
        }[];
    } & {
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
    })[]>;
    findById(id: string): Promise<({
        timesheets: {
            id: string;
            status: import(".prisma/client").$Enums.TimesheetStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            projectId: string;
            notes: string | null;
            taskId: string | null;
            workDate: Date;
            durationHours: import("@prisma/client/runtime/library").Decimal;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal;
            billable: boolean;
            invoiced: boolean;
            invoiceId: string | null;
        }[];
        expenses: {
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
        }[];
        projectManager: {
            email: string;
            fullName: string;
            id: string;
        };
        teamMembers: {
            user: {
                email: string;
                fullName: string;
            };
            id: string;
        }[];
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            dueDate: Date | null;
            projectId: string;
            title: string;
            state: import(".prisma/client").$Enums.TaskState;
            priority: import(".prisma/client").$Enums.TaskPriority;
            assigneeId: string | null;
            estimateHours: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
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
    }) | null>;
    create(body: CreateProjectDto): Promise<{
        projectManager: {
            email: string;
            fullName: string;
            id: string;
        };
    } & {
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
    }>;
    update(id: string, body: UpdateProjectDto): Promise<{
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
    }>;
    getFinancials(projectId: string): Promise<{
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
    } | null>;
    /**
     * Get detailed project overview with all related documents
     * Supports all three scenarios
     */
    getProjectOverview(projectId: string): Promise<{
        project: {
            timesheets: ({
                user: {
                    fullName: string;
                };
                task: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    dueDate: Date | null;
                    projectId: string;
                    title: string;
                    state: import(".prisma/client").$Enums.TaskState;
                    priority: import(".prisma/client").$Enums.TaskPriority;
                    assigneeId: string | null;
                    estimateHours: import("@prisma/client/runtime/library").Decimal | null;
                } | null;
            } & {
                id: string;
                status: import(".prisma/client").$Enums.TimesheetStatus;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                projectId: string;
                notes: string | null;
                taskId: string | null;
                workDate: Date;
                durationHours: import("@prisma/client/runtime/library").Decimal;
                hourlyRate: import("@prisma/client/runtime/library").Decimal;
                amount: import("@prisma/client/runtime/library").Decimal;
                billable: boolean;
                invoiced: boolean;
                invoiceId: string | null;
            })[];
            expenses: ({
                user: {
                    fullName: string;
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
            })[];
            projectManager: {
                email: string;
                fullName: string;
                id: string;
            };
            teamMembers: ({
                user: {
                    email: string;
                    fullName: string;
                    id: string;
                };
            } & {
                role: string;
                id: string;
                userId: string;
                projectId: string;
                addedAt: Date;
            })[];
            tasks: ({
                assignee: {
                    fullName: string;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                dueDate: Date | null;
                projectId: string;
                title: string;
                state: import(".prisma/client").$Enums.TaskState;
                priority: import(".prisma/client").$Enums.TaskPriority;
                assigneeId: string | null;
                estimateHours: import("@prisma/client/runtime/library").Decimal | null;
            })[];
            milestones: {
                id: string;
                status: import(".prisma/client").$Enums.MilestoneStatus;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                dueDate: Date | null;
                projectId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                invoiced: boolean;
                invoiceId: string | null;
                completedDate: Date | null;
            }[];
            salesOrders: ({
                lines: {
                    id: string;
                    description: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    soId: string;
                    productId: string | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
                number: string;
                id: string;
                status: import(".prisma/client").$Enums.DocumentStatus;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                projectId: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                customerId: string | null;
                customerName: string | null;
            })[];
            purchaseOrders: ({
                lines: {
                    id: string;
                    description: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    productId: string | null;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    poId: string;
                }[];
            } & {
                number: string;
                id: string;
                status: import(".prisma/client").$Enums.DocumentStatus;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                projectId: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                vendorId: string | null;
                vendorName: string | null;
            })[];
            customerInvoices: ({
                invoiceLines: {
                    id: string;
                    createdAt: Date;
                    description: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: string;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    timesheetId: string | null;
                    expenseId: string | null;
                }[];
            } & {
                number: string;
                id: string;
                status: import(".prisma/client").$Enums.DocumentStatus;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                dueDate: Date | null;
                projectId: string | null;
                sourceSoId: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
            })[];
            vendorBills: ({
                billLines: {
                    id: string;
                    createdAt: Date;
                    description: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    billId: string;
                }[];
            } & {
                number: string;
                id: string;
                status: import(".prisma/client").$Enums.DocumentStatus;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                dueDate: Date | null;
                projectId: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
                sourcePo: string | null;
                vendorId: string | null;
                vendorName: string | null;
            })[];
        } & {
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
        financials: {
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
        } | null;
    } | null>;
}
export {};
//# sourceMappingURL=projects.service.d.ts.map
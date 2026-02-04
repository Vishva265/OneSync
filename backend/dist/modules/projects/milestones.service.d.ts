import { PrismaService } from '@/prisma/prisma.service';
export declare class MilestonesService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Create a milestone for a project
     */
    createMilestone(data: {
        projectId: string;
        name: string;
        description?: string;
        amount: number;
        dueDate?: Date | string;
    }): Promise<{
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
    }>;
    /**
     * Get all milestones for a project
     */
    getMilestonesByProject(projectId: string): Promise<{
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
    }[]>;
    /**
     * Mark a milestone as done
     */
    markMilestoneDone(milestoneId: string): Promise<{
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
    }>;
    /**
     * Create invoice from a completed milestone
     * Scenario 8.1: When milestone is done, create customer invoice
     */
    createInvoiceFromMilestone(milestoneId: string): Promise<{
        invoice: {
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
        };
        milestone: {
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
        };
    }>;
    /**
     * Update milestone
     */
    updateMilestone(milestoneId: string, data: {
        name?: string;
        description?: string;
        amount?: number;
        status?: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
        dueDate?: Date | string;
    }): Promise<{
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
    }>;
}
//# sourceMappingURL=milestones.service.d.ts.map
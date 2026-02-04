import { $Enums, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findByProject(projectId: string): Promise<({
        project: {
            id: string;
            name: string;
        };
        timesheets: {
            id: string;
            status: $Enums.TimesheetStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            projectId: string;
            notes: string | null;
            taskId: string | null;
            workDate: Date;
            durationHours: Prisma.Decimal;
            hourlyRate: Prisma.Decimal;
            amount: Prisma.Decimal;
            billable: boolean;
            invoiced: boolean;
            invoiceId: string | null;
        }[];
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: Prisma.Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        projectId: string;
        title: string;
        state: $Enums.TaskState;
        priority: $Enums.TaskPriority;
        assigneeId: string | null;
        estimateHours: Prisma.Decimal | null;
    })[]>;
    getProjectWithTeamMembers(projectId: string): Promise<{
        teamMembers: ({
            user: {
                email: string;
                fullName: string;
                role: $Enums.UserRole;
                id: string;
                passwordHash: string;
                status: $Enums.UserStatus;
                defaultHourlyRate: Prisma.Decimal;
                timezone: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            role: string;
            id: string;
            userId: string;
            projectId: string;
            addedAt: Date;
        })[];
    } & {
        id: string;
        status: $Enums.ProjectStatus;
        defaultHourlyRate: Prisma.Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
        budgetAmount: Prisma.Decimal | null;
        currency: string;
        startDate: Date;
        customerId: string | null;
        projectManagerId: string;
        endDate: Date | null;
        billableFlag: boolean;
        projectType: $Enums.ProjectType;
    }>;
    findById(id: string): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
            defaultHourlyRate: Prisma.Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: Prisma.Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: $Enums.ProjectType;
        };
        timesheets: {
            id: string;
            status: $Enums.TimesheetStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            projectId: string;
            notes: string | null;
            taskId: string | null;
            workDate: Date;
            durationHours: Prisma.Decimal;
            hourlyRate: Prisma.Decimal;
            amount: Prisma.Decimal;
            billable: boolean;
            invoiced: boolean;
            invoiceId: string | null;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            taskId: string | null;
            invoiceId: string | null;
            timesheetId: string | null;
            expenseId: string | null;
            billId: string | null;
            entityType: string;
            entityId: string;
            authorId: string;
            content: string;
            mentions: string[];
        }[];
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: Prisma.Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        projectId: string;
        title: string;
        state: $Enums.TaskState;
        priority: $Enums.TaskPriority;
        assigneeId: string | null;
        estimateHours: Prisma.Decimal | null;
    }>;
    /**
     * ✅ Create task — allows any valid user (not just project members)
     */
    create(projectId: string, data: CreateTaskDto): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
            defaultHourlyRate: Prisma.Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: Prisma.Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: $Enums.ProjectType;
        };
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: Prisma.Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        projectId: string;
        title: string;
        state: $Enums.TaskState;
        priority: $Enums.TaskPriority;
        assigneeId: string | null;
        estimateHours: Prisma.Decimal | null;
    }>;
    /**
     * ✅ Update task — allows assigning any valid user
     */
    update(id: string, data: Prisma.TaskUpdateInput & {
        assigneeId?: string | null;
    }): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
            defaultHourlyRate: Prisma.Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: Prisma.Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: $Enums.ProjectType;
        };
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: Prisma.Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        projectId: string;
        title: string;
        state: $Enums.TaskState;
        priority: $Enums.TaskPriority;
        assigneeId: string | null;
        estimateHours: Prisma.Decimal | null;
    }>;
    moveTask(id: string, newState: $Enums.TaskState): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
            defaultHourlyRate: Prisma.Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: Prisma.Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: $Enums.ProjectType;
        };
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: Prisma.Decimal;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        projectId: string;
        title: string;
        state: $Enums.TaskState;
        priority: $Enums.TaskPriority;
        assigneeId: string | null;
        estimateHours: Prisma.Decimal | null;
    }>;
    getTaskStatusAnalytics(): Promise<{
        name: $Enums.TaskState;
        value: number;
    }[]>;
}
//# sourceMappingURL=tasks.service.d.ts.map
import { TasksService } from "./tasks.service";
import { $Enums } from "@prisma/client";
import { CreateTaskDto } from "./dto/create-task.dto";
declare class MoveTaskDto {
    state: $Enums.TaskState;
}
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
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
            durationHours: import("@prisma/client/runtime/library").Decimal;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal;
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
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
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
        estimateHours: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getProjectTeamMembers(projectId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: string;
    }[]>;
    findById(id: string): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
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
            durationHours: import("@prisma/client/runtime/library").Decimal;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal;
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
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
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
        estimateHours: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    create(projectId: string, data: CreateTaskDto): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
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
            projectType: $Enums.ProjectType;
        };
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
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
        estimateHours: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, body: any): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
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
            projectType: $Enums.ProjectType;
        };
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
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
        estimateHours: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    moveTask(id: string, body: MoveTaskDto): Promise<{
        project: {
            id: string;
            status: $Enums.ProjectStatus;
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
            projectType: $Enums.ProjectType;
        };
        assignee: {
            email: string;
            fullName: string;
            role: $Enums.UserRole;
            id: string;
            passwordHash: string;
            status: $Enums.UserStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
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
        estimateHours: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
export {};
//# sourceMappingURL=tasks.controller.d.ts.map
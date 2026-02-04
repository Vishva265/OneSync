import { TaskPriority, TaskState } from "@prisma/client";
export declare class CreateTaskDto {
    title: string;
    description?: string;
    state?: TaskState;
    priority?: TaskPriority;
    assigneeId?: string;
    estimateHours?: number;
    dueDate?: Date;
}
//# sourceMappingURL=create-task.dto.d.ts.map
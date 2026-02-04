import { TasksService } from "../tasks/tasks.service";
import { ProjectsService } from "../projects/projects.service";
export declare class AnalyticsController {
    private readonly tasksService;
    private readonly projectsService;
    constructor(tasksService: TasksService, projectsService: ProjectsService);
    getTaskStatusStats(): Promise<{
        name: import(".prisma/client").$Enums.TaskState;
        value: number;
    }[]>;
    getProjectMetrics(): Promise<{
        totalProjects: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
    }>;
    getUtilizationTrend(): Promise<{
        month: string;
        utilization: number;
    }[]>;
}
//# sourceMappingURL=analytics.controller.d.ts.map
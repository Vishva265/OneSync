import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt.guard";
import { TasksService } from "../tasks/tasks.service";
import { ProjectsService } from "../projects/projects.service";

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("api/v1/analytics")
export class AnalyticsController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService
  ) {}

  @Get("task-status")
  async getTaskStatusStats() {
    return this.tasksService.getTaskStatusAnalytics();
  }

  @Get("project-metrics")
  async getProjectMetrics() {
    return this.projectsService.getProjectMetrics();
  }

  @Get("utilization")
  async getUtilizationTrend() {
    return this.projectsService.getUtilizationTrend();
  }
}
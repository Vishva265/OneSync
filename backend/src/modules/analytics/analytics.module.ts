import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { TasksModule } from "../tasks/tasks.module";
import { ProjectsModule } from "../projects/projects.module";

@Module({
  imports: [TasksModule, ProjectsModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
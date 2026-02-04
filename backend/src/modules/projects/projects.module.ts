import { Module } from "@nestjs/common"
import { ProjectsService } from "./projects.service"
import { ProjectsController } from "./projects.controller"
import { MilestonesService } from "./milestones.service"
import { PrismaModule } from "@/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [ProjectsService, MilestonesService],
  controllers: [ProjectsController],
  exports: [ProjectsService, MilestonesService],
})
export class ProjectsModule {}

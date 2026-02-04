import { Controller, Get, Post, Put, Param, Body, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import { TasksService } from "./tasks.service"
import { $Enums } from "@prisma/client"
import { IsEnum } from "class-validator"
import { CreateTaskDto } from "./dto/create-task.dto"

// DTO for moving task
class MoveTaskDto {
  @IsEnum($Enums.TaskState)
  state: $Enums.TaskState
}

@ApiTags("Tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get("projects/:projectId/tasks")
  async findByProject(@Param("projectId") projectId: string) {
    return this.tasksService.findByProject(projectId)
  }

  @Get("projects/:projectId/team-members")
  async getProjectTeamMembers(@Param("projectId") projectId: string) {
    const project = await this.tasksService.getProjectWithTeamMembers(projectId)
    return project.teamMembers.map((member) => ({
      id: member.user.id,
      fullName: member.user.fullName,
      email: member.user.email,
      role: member.role,
    }))
  }

  @Get("tasks/:id")
  async findById(@Param("id") id: string) {
    return this.tasksService.findById(id)
  }

  @Post("projects/:projectId/tasks")
  async create(@Param("projectId") projectId: string, @Body() data: CreateTaskDto) {
    console.log("📤 Incoming create-task:", data)
    return this.tasksService.create(projectId, data)
  }

  @Put("tasks/:id")
  async update(@Param("id") id: string, @Body() body: any) {
    return this.tasksService.update(id, body)
  }

  @Post("tasks/:id/move")
  async moveTask(@Param("id") id: string, @Body() body: MoveTaskDto) {
    return this.tasksService.moveTask(id, body.state)
  }
}

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { $Enums, Prisma } from "@prisma/client"
import { PrismaService } from "@/prisma/prisma.service"
import { CreateTaskDto } from "./dto/create-task.dto"

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: { include: { user: true } } },
    })
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`)

    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        timesheets: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async getProjectWithTeamMembers(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: { include: { user: true } } },
    })
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`)
    return project
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignee: true, timesheets: true, comments: true, project: true },
    })
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`)
    return task
  }

  /**
   * ✅ Create task — allows any valid user (not just project members)
   */
  async create(projectId: string, data: CreateTaskDto) {
    console.log("📥 Creating task with data:", data)

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    })
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`)

    // ✅ Optional: Validate user exists if provided
    if (data.assigneeId && typeof data.assigneeId === "string") {
      const userExists = await this.prisma.user.findUnique({
        where: { id: data.assigneeId },
      })
      if (!userExists)
        throw new BadRequestException(`User with ID ${data.assigneeId} does not exist`)
    }

    const state = data.state ?? $Enums.TaskState.NEW

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        state,
        priority: data.priority ?? "MEDIUM",
        estimateHours: data.estimateHours ?? null,
        dueDate: data.dueDate ?? null,
        project: { connect: { id: projectId } },
        ...(data.assigneeId
          ? { assignee: { connect: { id: data.assigneeId } } }
          : {}),
      },
      include: {
        assignee: true,
        project: true,
      },
    })
  }

  /**
   * ✅ Update task — allows assigning any valid user
   */
  async update(
    id: string,
    data: Prisma.TaskUpdateInput & { assigneeId?: string | null },
  ) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    })
    if (!existing) throw new NotFoundException(`Task with ID ${id} not found`)

    // ✅ Check only if user exists (no need to be a team member)
    if (data.assigneeId && typeof data.assigneeId === "string") {
      const userExists = await this.prisma.user.findUnique({
        where: { id: data.assigneeId },
      })
      if (!userExists)
        throw new BadRequestException(`User with ID ${data.assigneeId} does not exist`)
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        state: data.state,
        priority: data.priority,
        estimateHours: data.estimateHours,
        dueDate: data.dueDate,
        ...(data.assigneeId === null
          ? { assignee: { disconnect: true } }
          : data.assigneeId
          ? { assignee: { connect: { id: data.assigneeId } } }
          : {}),
      },
      include: { assignee: true, project: true },
    })
  }

  async moveTask(id: string, newState: $Enums.TaskState) {
    return this.prisma.task.update({
      where: { id },
      data: { state: newState },
      include: { assignee: true, project: true },
    })
  }

  async getTaskStatusAnalytics() {
    const taskCounts = await this.prisma.task.groupBy({
      by: ["state"],
      _count: { id: true },
    })
    return taskCounts.map((c) => ({ name: c.state, value: c._count.id }))
  }
}

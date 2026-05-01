import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { $Enums, Prisma } from "@prisma/client"
import { PrismaService } from "@/prisma/prisma.service"
import { CreateTaskDto } from "./dto/create-task.dto"

type AuthUser = {
  id?: string
  sub?: string
  userId?: string
  role?: string
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private userId(user?: AuthUser) {
    return user?.userId ?? user?.id ?? user?.sub
  }

  private role(user?: AuthUser) {
    return String(user?.role || "").toUpperCase()
  }

  private canManageProject(projectManagerId: string, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    return role === "ADMIN" || (role === "PROJECT_MANAGER" && userId === projectManagerId)
  }

  private assertCanManageProject(projectManagerId: string, user?: AuthUser) {
    if (!this.canManageProject(projectManagerId, user)) {
      throw new ForbiddenException("Only the project manager or an admin can manage tasks for this project")
    }
  }

  private async assertAssignableUser(projectId: string, assigneeId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        projectManagerId: true,
        teamMembers: {
          where: { userId: assigneeId },
          select: { id: true },
        },
      },
    })
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`)

    if (project.projectManagerId !== assigneeId && project.teamMembers.length === 0) {
      throw new BadRequestException("Assignee must be the project manager or a project team member")
    }
  }

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

  async create(projectId: string, data: CreateTaskDto, user?: AuthUser) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    })
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`)

    this.assertCanManageProject(project.projectManagerId, user)

    if (data.assigneeId && typeof data.assigneeId === "string") {
      await this.assertAssignableUser(projectId, data.assigneeId)
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
        ...(data.assigneeId ? { assignee: { connect: { id: data.assigneeId } } } : {}),
      },
      include: {
        assignee: true,
        project: true,
      },
    })
  }

  async update(
    id: string,
    data: Prisma.TaskUpdateInput & { assigneeId?: string | null },
    user?: AuthUser,
  ) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        projectId: true,
        project: { select: { projectManagerId: true } },
      },
    })
    if (!existing) throw new NotFoundException(`Task with ID ${id} not found`)

    this.assertCanManageProject(existing.project.projectManagerId, user)

    if (data.assigneeId && typeof data.assigneeId === "string") {
      await this.assertAssignableUser(existing.projectId, data.assigneeId)
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

  async moveTask(id: string, newState: $Enums.TaskState, user?: AuthUser) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        assigneeId: true,
        project: { select: { projectManagerId: true } },
      },
    })
    if (!existing) throw new NotFoundException(`Task with ID ${id} not found`)

    const userId = this.userId(user)
    const isAssignee = !!userId && existing.assigneeId === userId
    if (!isAssignee && !this.canManageProject(existing.project.projectManagerId, user)) {
      throw new ForbiddenException("Only the assignee, project manager, or admin can move this task")
    }

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

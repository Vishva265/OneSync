import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

type AuthUser = {
  id?: string
  sub?: string
  userId?: string
  role?: string
}

const DEFAULT_HOURLY_RATE = Number(process.env.DEFAULT_HOURLY_RATE || 50)

@Injectable()
export class TimesheetsService {
  constructor(private prisma: PrismaService) {}

  private userId(user?: AuthUser) {
    return user?.userId ?? user?.id ?? user?.sub
  }

  private role(user?: AuthUser) {
    return String(user?.role || "").toUpperCase()
  }

  private decimalToNumber(value: any) {
    return value?.toNumber?.() ?? Number(value) ?? 0
  }

  private positiveNumber(value: any) {
    const numberValue = this.decimalToNumber(value)
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0
  }

  private async resolveHourlyRate(projectId: string, userId: string) {
    const [project, user] = await this.prisma.$transaction([
      this.prisma.project.findUnique({
        where: { id: projectId },
        select: { defaultHourlyRate: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { defaultHourlyRate: true },
      }),
    ])

    if (!project) throw new NotFoundException("Project not found")
    if (!user) throw new NotFoundException("User not found")

    const rate =
      this.positiveNumber(project.defaultHourlyRate) ||
      this.positiveNumber(user.defaultHourlyRate) ||
      this.positiveNumber(DEFAULT_HOURLY_RATE)

    if (!rate) throw new BadRequestException("No hourly rate is configured for this project or user")
    return rate
  }

  private normalizeTimesheetRate(timesheet: any) {
    if (!timesheet) return timesheet

    const durationHours = this.decimalToNumber(timesheet.durationHours)
    const savedRate = this.positiveNumber(timesheet.hourlyRate)
    const savedAmount = this.positiveNumber(timesheet.amount)
    const effectiveRate =
      savedRate ||
      this.positiveNumber(timesheet.project?.defaultHourlyRate) ||
      this.positiveNumber(timesheet.user?.defaultHourlyRate) ||
      this.positiveNumber(DEFAULT_HOURLY_RATE)

    return {
      ...timesheet,
      hourlyRate: savedRate || effectiveRate,
      amount: savedAmount || durationHours * effectiveRate,
    }
  }

  private async assertCanLogToProject(projectId: string, user?: AuthUser) {
    const userId = this.userId(user)
    if (!userId) throw new BadRequestException("Authenticated user is required")
    if (this.role(user) === "ADMIN") return

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        projectManagerId: true,
        teamMembers: {
          where: { userId },
          select: { id: true },
        },
      },
    })
    if (!project) throw new NotFoundException("Project not found")

    if (project.projectManagerId !== userId && project.teamMembers.length === 0) {
      throw new ForbiddenException("You can only log time to projects you manage or belong to")
    }
  }

  private canReview(projectManagerId: string, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    return role === "ADMIN" || (role === "PROJECT_MANAGER" && userId === projectManagerId)
  }

  private canView(timesheet: { userId: string; project: { projectManagerId: string } }, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    return (
      role === "ADMIN" ||
      role === "FINANCE" ||
      timesheet.userId === userId ||
      (role === "PROJECT_MANAGER" && timesheet.project.projectManagerId === userId)
    )
  }

  async create(data: any, user?: AuthUser) {
    const userId = this.userId(user)
    const durationHours = Number(data.durationHours || 0)
    const workDate = data.workDate ? new Date(data.workDate) : null

    if (!userId) throw new BadRequestException("Authenticated user is required")
    if (!data.projectId) throw new BadRequestException("Project is required")
    if (!workDate || Number.isNaN(workDate.getTime())) throw new BadRequestException("Valid work date is required")
    if (durationHours <= 0) throw new BadRequestException("Duration must be greater than zero")

    await this.assertCanLogToProject(data.projectId, user)

    if (data.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: data.taskId },
        select: { projectId: true },
      })
      if (!task || task.projectId !== data.projectId) {
        throw new BadRequestException("Task must belong to the selected project")
      }
    }

    const hourlyRate = await this.resolveHourlyRate(data.projectId, userId)

    return this.prisma.timesheet.create({
      data: {
        userId,
        projectId: data.projectId,
        taskId: data.taskId || undefined,
        workDate,
        durationHours,
        hourlyRate,
        amount: durationHours * hourlyRate,
        billable: Boolean(data.billable),
        notes: data.notes || undefined,
        status: "DRAFT",
        invoiced: false,
      },
    })
  }

  async findAll(filters: any = {}, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    const where: any = { ...filters }

    if (role === "TEAM_MEMBER" || role === "VIEWER" || !["ADMIN", "FINANCE", "PROJECT_MANAGER"].includes(role)) {
      where.userId = userId
    } else if (role === "PROJECT_MANAGER") {
      where.project = { projectManagerId: userId }
    }

    const timesheets = await this.prisma.timesheet.findMany({
      where,
      include: { user: true, project: true, task: true },
      orderBy: { workDate: "desc" },
    })
    return timesheets.map((timesheet) => this.normalizeTimesheetRate(timesheet))
  }

  async findById(id: string, user?: AuthUser) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id },
      include: { user: true, project: true, task: true },
    })
    if (!timesheet) throw new NotFoundException("Timesheet not found")
    if (!this.canView(timesheet, user)) throw new ForbiddenException("You cannot access this timesheet")
    return this.normalizeTimesheetRate(timesheet)
  }

  async update(id: string, data: any, user?: AuthUser) {
    const existing = await this.prisma.timesheet.findUnique({
      where: { id },
      include: { project: true },
    })
    if (!existing) throw new NotFoundException("Timesheet not found")
    if (existing.invoiced) throw new BadRequestException("Invoiced timesheets cannot be edited")

    const userId = this.userId(user)
    const isOwner = existing.userId === userId
    const isReviewer = this.canReview(existing.project.projectManagerId, user)
    if (!isOwner && !isReviewer) throw new ForbiddenException("You cannot update this timesheet")
    if (isOwner && !["DRAFT", "REJECTED"].includes(existing.status)) {
      throw new BadRequestException("Only draft or rejected timesheets can be edited by the owner")
    }

    const patch: any = {}
    if (data.projectId !== undefined && data.projectId !== existing.projectId) {
      await this.assertCanLogToProject(data.projectId, user)
      patch.projectId = data.projectId
    }
    const targetProjectId = patch.projectId ?? existing.projectId

    if (data.taskId !== undefined) {
      if (data.taskId) {
        const task = await this.prisma.task.findUnique({
          where: { id: data.taskId },
          select: { projectId: true },
        })
        if (!task || task.projectId !== targetProjectId) {
          throw new BadRequestException("Task must belong to the selected project")
        }
        patch.taskId = data.taskId
      } else {
        patch.taskId = null
      }
    }

    if (data.workDate !== undefined) {
      const workDate = new Date(data.workDate)
      if (Number.isNaN(workDate.getTime())) throw new BadRequestException("Valid work date is required")
      patch.workDate = workDate
    }
    if (data.durationHours !== undefined) {
      const durationHours = Number(data.durationHours)
      if (durationHours <= 0) throw new BadRequestException("Duration must be greater than zero")
      patch.durationHours = durationHours
    }
    if (data.billable !== undefined) patch.billable = Boolean(data.billable)
    if (data.notes !== undefined) patch.notes = data.notes || null

    if (patch.projectId !== undefined) {
      patch.hourlyRate = await this.resolveHourlyRate(targetProjectId, existing.userId)
    }

    if (patch.durationHours !== undefined || patch.hourlyRate !== undefined) {
      const durationHours = patch.durationHours ?? this.decimalToNumber(existing.durationHours)
      const hourlyRate = patch.hourlyRate ?? this.decimalToNumber(existing.hourlyRate)
      patch.amount = durationHours * hourlyRate
    }

    return this.prisma.timesheet.update({
      where: { id },
      data: patch,
      include: { user: true, project: true, task: true },
    })
  }

  async approve(id: string, user?: AuthUser) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id },
      include: { project: true },
    })
    if (!timesheet) throw new NotFoundException("Timesheet not found")
    if (!this.canReview(timesheet.project.projectManagerId, user)) {
      throw new ForbiddenException("Only the project manager or an admin can approve this timesheet")
    }
    if (timesheet.invoiced) throw new BadRequestException("Invoiced timesheets cannot be changed")

    return this.prisma.timesheet.update({
      where: { id },
      data: { status: "APPROVED" },
    })
  }

  async reject(id: string, user?: AuthUser) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id },
      include: { project: true },
    })
    if (!timesheet) throw new NotFoundException("Timesheet not found")
    if (!this.canReview(timesheet.project.projectManagerId, user)) {
      throw new ForbiddenException("Only the project manager or an admin can reject this timesheet")
    }
    if (timesheet.invoiced) throw new BadRequestException("Invoiced timesheets cannot be changed")

    return this.prisma.timesheet.update({
      where: { id },
      data: { status: "REJECTED" },
    })
  }

  async markInvoiced(id: string, invoiceId: string) {
    return this.prisma.timesheet.update({
      where: { id },
      data: { invoiced: true, invoiceId },
    })
  }
}

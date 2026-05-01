import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

type AuthUser = {
  id?: string
  sub?: string
  userId?: string
  role?: string
}

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  private userId(user?: AuthUser) {
    return user?.userId ?? user?.id ?? user?.sub
  }

  private role(user?: AuthUser) {
    return String(user?.role || "").toUpperCase()
  }

  private canApprove(projectManagerId: string, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    return role === "ADMIN" || (role === "PROJECT_MANAGER" && userId === projectManagerId)
  }

  private canView(expense: { userId: string; project: { projectManagerId: string } }, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    return (
      role === "ADMIN" ||
      role === "FINANCE" ||
      expense.userId === userId ||
      (role === "PROJECT_MANAGER" && expense.project.projectManagerId === userId)
    )
  }

  private async assertCanSubmitForProject(projectId: string, user?: AuthUser) {
    const userId = this.userId(user)
    if (!userId) throw new BadRequestException("Authenticated user is required")
    if (["ADMIN", "FINANCE"].includes(this.role(user))) return

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
      throw new ForbiddenException("You can only submit expenses to projects you manage or belong to")
    }
  }

  async create(data: any, user?: AuthUser) {
    const userId = this.userId(user)
    const amount = Number(data.amount)
    const date = data.date ? new Date(data.date) : null

    if (!userId) throw new BadRequestException("Authenticated user is required")
    if (!data.projectId) throw new BadRequestException("Project is required")
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException("Amount must be greater than zero")
    if (!date || Number.isNaN(date.getTime())) throw new BadRequestException("Valid expense date is required")
    if (!data.category) throw new BadRequestException("Category is required")

    await this.assertCanSubmitForProject(data.projectId, user)

    return this.prisma.expense.create({
      data: {
        userId,
        projectId: data.projectId,
        amount,
        currency: data.currency || "USD",
        date,
        category: data.category,
        billable: Boolean(data.billable),
        status: "SUBMITTED",
        reimbursed: false,
        receiptUrl: data.receiptUrl || null,
        notes: data.notes || null,
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

    return this.prisma.expense.findMany({
      where,
      include: { user: true, project: true },
      orderBy: { date: "desc" },
    })
  }

  async findById(id: string, user?: AuthUser) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { user: true, project: true },
    })
    if (!expense) throw new NotFoundException("Expense not found")
    if (!this.canView(expense, user)) throw new ForbiddenException("You cannot access this expense")
    return expense
  }

  async update(id: string, data: any, user?: AuthUser) {
    const existing = await this.prisma.expense.findUnique({
      where: { id },
      include: { project: true },
    })
    if (!existing) throw new NotFoundException("Expense not found")
    if (existing.reimbursed) throw new BadRequestException("Reimbursed expenses cannot be edited")

    const userId = this.userId(user)
    const isOwner = existing.userId === userId
    const isApprover = this.canApprove(existing.project.projectManagerId, user)
    const isFinance = this.role(user) === "FINANCE"
    if (!isOwner && !isApprover && !isFinance) throw new ForbiddenException("You cannot update this expense")
    if (isOwner && !["SUBMITTED", "REJECTED"].includes(existing.status)) {
      throw new BadRequestException("Only submitted or rejected expenses can be edited by the owner")
    }

    const patch: any = {}
    if (data.projectId !== undefined && data.projectId !== existing.projectId) {
      await this.assertCanSubmitForProject(data.projectId, user)
      patch.projectId = data.projectId
    }
    if (data.amount !== undefined) {
      const amount = Number(data.amount)
      if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException("Amount must be greater than zero")
      patch.amount = amount
    }
    if (data.date !== undefined) {
      const date = new Date(data.date)
      if (Number.isNaN(date.getTime())) throw new BadRequestException("Valid expense date is required")
      patch.date = date
    }
    if (data.category !== undefined) {
      if (!data.category) throw new BadRequestException("Category is required")
      patch.category = data.category
    }
    if (data.currency !== undefined) patch.currency = data.currency || "USD"
    if (data.billable !== undefined) patch.billable = Boolean(data.billable)
    if (data.receiptUrl !== undefined) patch.receiptUrl = data.receiptUrl || null
    if (data.notes !== undefined) patch.notes = data.notes || null

    return this.prisma.expense.update({
      where: { id },
      data: patch,
      include: { user: true, project: true },
    })
  }

  async approve(id: string, user?: AuthUser) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { project: true },
    })
    if (!expense) throw new NotFoundException("Expense not found")
    if (!this.canApprove(expense.project.projectManagerId, user)) {
      throw new ForbiddenException("Only the project manager or an admin can approve this expense")
    }
    if (expense.status === "APPROVED") throw new BadRequestException("Expense already approved")
    if (expense.reimbursed) throw new BadRequestException("Reimbursed expenses cannot be changed")

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: { status: "APPROVED" },
      })

      await tx.auditLog.create({
        data: {
          action: "EXPENSE_APPROVED",
          entityType: "EXPENSE",
          entityId: id,
          userId: this.userId(user),
          details: `Expense approved for amount ${expense.amount}`,
        },
      })

      return updated
    })
  }

  async reject(id: string, reason?: string, user?: AuthUser) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { project: true },
    })
    if (!expense) throw new NotFoundException("Expense not found")
    if (!this.canApprove(expense.project.projectManagerId, user)) {
      throw new ForbiddenException("Only the project manager or an admin can reject this expense")
    }
    if (expense.reimbursed) throw new BadRequestException("Reimbursed expenses cannot be changed")

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: { status: "REJECTED" },
      })

      await tx.auditLog.create({
        data: {
          action: "EXPENSE_REJECTED",
          entityType: "EXPENSE",
          entityId: id,
          userId: this.userId(user),
          details: reason || "Expense rejected",
        },
      })

      return updated
    })
  }

  async reimburse(id: string, user?: AuthUser) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    })
    if (!expense) throw new NotFoundException("Expense not found")
    if (!["ADMIN", "FINANCE"].includes(this.role(user))) {
      throw new ForbiddenException("Only finance or admin users can reimburse expenses")
    }
    if (expense.status !== "APPROVED") throw new BadRequestException("Expense must be approved before reimbursement")
    if (expense.reimbursed) throw new BadRequestException("Expense already reimbursed")

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: { reimbursed: true },
      })

      await tx.auditLog.create({
        data: {
          action: "EXPENSE_REIMBURSED",
          entityType: "EXPENSE",
          entityId: id,
          userId: this.userId(user),
          details: `Expense reimbursed for amount ${expense.amount}`,
        },
      })

      return updated
    })
  }

  async getByProject(projectId: string, user?: AuthUser) {
    return this.findAll({ projectId }, user)
  }

  async getPendingExpenses(projectId?: string, user?: AuthUser) {
    const role = this.role(user)
    const userId = this.userId(user)
    const where: any = {
      status: "SUBMITTED",
      ...(projectId ? { projectId } : {}),
    }

    if (role === "PROJECT_MANAGER") {
      where.project = { projectManagerId: userId }
    } else if (!["ADMIN", "FINANCE"].includes(role)) {
      where.userId = userId
    }

    return this.prisma.expense.findMany({
      where,
      include: { user: true, project: true },
      orderBy: { date: "desc" },
    })
  }
}

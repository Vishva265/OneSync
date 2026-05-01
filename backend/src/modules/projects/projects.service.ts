// src/modules/projects/projects.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

type CreateProjectDto = {
  name: string
  code?: string
  description?: string
  budgetAmount?: number | string
  currency?: string
  status?: string // will map to your enum
  startDate?: string | Date
  dueDate?: string | Date // FE name -> maps to endDate
  managerId?: string      // FE name -> maps to projectManagerId
  // accept passthrough fields if you have more...
  [key: string]: any
}

type UpdateProjectDto = CreateProjectDto

type AuthUser = {
  id?: string
  sub?: string
  userId?: string
  role?: string
}

const ALLOWED_STATUSES = new Set([
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
])

const REVENUE_STATUSES = new Set(["POSTED", "PAID"])
const COST_DOCUMENT_STATUSES = new Set(["POSTED", "PAID"])

function decimalToNumber(value: any) {
  return value?.toNumber?.() ?? Number(value) ?? 0
}

function positiveNumber(value: any) {
  const numberValue = decimalToNumber(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0
}

function timesheetAmount(timesheet: any) {
  const savedAmount = positiveNumber(timesheet.amount)
  if (savedAmount) return savedAmount

  const durationHours = decimalToNumber(timesheet.durationHours)
  const hourlyRate =
    positiveNumber(timesheet.hourlyRate) ||
    positiveNumber(timesheet.project?.defaultHourlyRate) ||
    positiveNumber(timesheet.user?.defaultHourlyRate) ||
    50

  return durationHours * hourlyRate
}

function normalizeProjectStatus(status?: string) {
  if (!status) return "PLANNING"
  const normalized = String(status).toUpperCase()
  if (!ALLOWED_STATUSES.has(normalized)) {
    throw new BadRequestException(`Invalid project status: ${status}`)
  }
  return normalized
}

function toDateOrNull(v?: string | Date) {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return isNaN(d.getTime()) ? null : d
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private userId(user?: AuthUser) {
    return user?.userId ?? user?.id ?? user?.sub
  }

  private role(user?: AuthUser) {
    return String(user?.role || "").toUpperCase()
  }

  private async assertCanManageProject(projectId: string, user?: AuthUser) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, projectManagerId: true },
    })
    if (!project) throw new NotFoundException("Project not found")

    const role = this.role(user)
    const userId = this.userId(user)
    if (role !== "ADMIN" && !(role === "PROJECT_MANAGER" && userId === project.projectManagerId)) {
      throw new ForbiddenException("Only the project manager or an admin can manage project team members")
    }

    return project
  }

  // ---------- Analytics helpers ----------
  async getProjectMetrics(): Promise<{
    totalProjects: number
    totalRevenue: number
    totalCost: number
    totalProfit: number
  }> {
    const totalProjects = await this.prisma.project.count()

    const invoices = await this.prisma.customerInvoice.findMany({
      where: { status: { in: Array.from(REVENUE_STATUSES) as any[] } },
      select: { totalAmount: true },
    })
    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + decimalToNumber(inv.totalAmount),
      0
    )

    const timesheets = await this.prisma.timesheet.findMany({
      where: { status: "APPROVED" },
      select: {
        durationHours: true,
        hourlyRate: true,
        amount: true,
        user: { select: { defaultHourlyRate: true } },
        project: { select: { defaultHourlyRate: true } },
      },
    })
    const timesheetCost = timesheets.reduce(
      (sum, ts) => sum + timesheetAmount(ts),
      0
    )

    const expenses = await this.prisma.expense.findMany({
      where: { status: "APPROVED" },
      select: { amount: true },
    })
    const expenseCost = expenses.reduce(
      (sum, e) => sum + decimalToNumber(e.amount),
      0
    )

    const vendorBills = await this.prisma.vendorBill.findMany({
      where: { status: { in: Array.from(COST_DOCUMENT_STATUSES) as any[] } },
      select: { totalAmount: true },
    })
    const vendorBillCost = vendorBills.reduce(
      (sum, bill) => sum + decimalToNumber(bill.totalAmount),
      0
    )

    const totalCost = timesheetCost + expenseCost + vendorBillCost

    return {
      totalProjects,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
    }
  }

  async getUtilizationTrend(): Promise<Array<{ month: string; utilization: number }>> {
    const timesheets = await this.prisma.timesheet.findMany({
      select: { workDate: true, durationHours: true },
    })

    const monthly = new Map<string, number>()
    timesheets.forEach((ts) => {
      const d = new Date(ts.workDate as any)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const hours = (ts.durationHours as any)?.toNumber?.() ?? Number(ts.durationHours) ?? 0
      monthly.set(key, (monthly.get(key) ?? 0) + hours)
    })

    return Array.from(monthly.entries())
      .sort()
      .map(([month, hours]) => ({ month, utilization: Math.round(hours) }))
  }

  // ---------- Queries ----------
  async findAll(filters?: any) {
    return this.prisma.project.findMany({
      where: filters,
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
        teamMembers: {
          select: {
            id: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    })
  }

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
        teamMembers: {
          select: {
            id: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        tasks: true,
        timesheets: true,
        expenses: true,
      },
    })
  }

  // ---------- Create / Update with mapping ----------
  async create(body: CreateProjectDto) {
    const {
      managerId, // FE -> maps to relation
      dueDate,   // FE -> endDate
      startDate,
      status,
      ...rest
    } = body

    if (!rest.name?.trim()) {
      throw new BadRequestException("Project name is required")
    }

    const safeStatus = normalizeProjectStatus(status)

    // date mapping
    const start = toDateOrNull(startDate) ?? new Date()
    const end = toDateOrNull(dueDate)

    // Build data for Prisma
    const data: any = {
      ...rest, // name, code, description, budgetAmount, currency, etc.
      status: safeStatus,
      startDate: start,
      endDate: end,
    }

    // Required relation: either set projectManagerId or connect via projectManager
    if (managerId) {
      // Either do a connect:
      data.projectManager = { connect: { id: managerId } }
      // or if you prefer raw FK: data.projectManagerId = managerId
    } else {
      // Since schema requires projectManagerId, we must fail here if FE omitted it
      throw new BadRequestException("managerId is required")
    }

    return this.prisma.project.create({
      data,
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
      },
    })
  }

  async update(id: string, body: UpdateProjectDto) {
    const {
      managerId, // FE optional on update
      dueDate,   // FE -> endDate
      startDate,
      status,
      ...rest
    } = body

    const patch: any = {
      ...rest,
    }

    // Optional status mapping on update
    if (typeof status !== "undefined") {
      patch.status = normalizeProjectStatus(status)
    }

    // Optional date mapping
    if (typeof startDate !== "undefined") {
      const sd = toDateOrNull(startDate)
      if (sd) patch.startDate = sd
    }
    if (typeof dueDate !== "undefined") {
      const ed = toDateOrNull(dueDate)
      patch.endDate = ed // can be null to clear
    }

    // Manager change (optional)
    if (typeof managerId !== "undefined") {
      if (managerId) {
        patch.projectManager = { connect: { id: managerId } }
        // or: patch.projectManagerId = managerId
      } else {
        // If you want to allow clearing manager (not typical since required FK):
        // patch.projectManager = { disconnect: true } // would violate required FK
        // Better to require a valid id:
        throw new BadRequestException("managerId cannot be empty")
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: patch,
    })
  }

  async addTeamMember(projectId: string, body: { userId?: string; role?: string }, user?: AuthUser) {
    const project = await this.assertCanManageProject(projectId, user)
    const userId = String(body.userId || "").trim()
    if (!userId) throw new BadRequestException("userId is required")
    if (userId === project.projectManagerId) {
      throw new BadRequestException("Project manager is already assigned to this project")
    }

    const memberUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!memberUser) throw new NotFoundException("User not found")

    return this.prisma.projectTeamMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role: String(body.role || "TEAM_MEMBER").trim() || "TEAM_MEMBER" },
      create: {
        projectId,
        userId,
        role: String(body.role || "TEAM_MEMBER").trim() || "TEAM_MEMBER",
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    })
  }

  async removeTeamMember(projectId: string, userId: string, user?: AuthUser) {
    await this.assertCanManageProject(projectId, user)

    const membership = await this.prisma.projectTeamMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { id: true },
    })
    if (!membership) throw new NotFoundException("Team member not found on this project")

    await this.prisma.projectTeamMember.delete({
      where: { projectId_userId: { projectId, userId } },
    })

    return { success: true }
  }

  // ---------- Per-project financials ----------
  async getFinancials(projectId: string) {
    const [
      project,
      invoiceRevenue,
      invoiceCount,
      approvedTimesheets,
      timesheetCount,
      expenseCostTotals,
      expenseCount,
      vendorBillCostTotals,
      vendorBillCount,
      salesOrderTotals,
      salesOrderCount,
      purchaseOrderTotals,
      purchaseOrderCount,
      milestoneTotals,
      milestoneDoneCount,
      milestoneInvoicedTotals,
    ] = await this.prisma.$transaction([
      this.prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true, code: true, currency: true, budgetAmount: true },
      }),
      this.prisma.customerInvoice.aggregate({
        where: { projectId, status: { in: Array.from(REVENUE_STATUSES) as any[] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.customerInvoice.count({ where: { projectId } }),
      this.prisma.timesheet.findMany({
        where: { projectId, status: "APPROVED" },
        select: {
          durationHours: true,
          hourlyRate: true,
          amount: true,
          user: { select: { defaultHourlyRate: true } },
          project: { select: { defaultHourlyRate: true } },
        },
      }),
      this.prisma.timesheet.count({ where: { projectId } }),
      this.prisma.expense.aggregate({
        where: { projectId, status: "APPROVED" },
        _sum: { amount: true },
      }),
      this.prisma.expense.count({ where: { projectId } }),
      this.prisma.vendorBill.aggregate({
        where: { projectId, status: { in: Array.from(COST_DOCUMENT_STATUSES) as any[] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.vendorBill.count({ where: { projectId } }),
      this.prisma.salesOrder.aggregate({
        where: { projectId, status: { notIn: ["CANCELLED", "ARCHIVED"] as any[] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.salesOrder.count({ where: { projectId } }),
      this.prisma.purchaseOrder.aggregate({
        where: { projectId, status: { notIn: ["CANCELLED", "ARCHIVED"] as any[] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.purchaseOrder.count({ where: { projectId } }),
      this.prisma.milestone.aggregate({
        where: { projectId },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.milestone.count({ where: { projectId, status: "DONE" } }),
      this.prisma.milestone.aggregate({
        where: { projectId, invoiced: true },
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ])

    if (!project) return null

    const revenue = decimalToNumber(invoiceRevenue._sum.totalAmount)
    const timesheetCost = approvedTimesheets.reduce((sum, timesheet) => sum + timesheetAmount(timesheet), 0)
    const expenseCost = decimalToNumber(expenseCostTotals._sum.amount)
    const vendorBillCost = decimalToNumber(vendorBillCostTotals._sum.totalAmount)
    const totalCost = timesheetCost + expenseCost + vendorBillCost

    const budgetAmount = decimalToNumber(project.budgetAmount)
    const budgetUsed = (totalCost / budgetAmount) * 100

    const salesOrderTotal = decimalToNumber(salesOrderTotals._sum.totalAmount)
    const purchaseOrderTotal = decimalToNumber(purchaseOrderTotals._sum.totalAmount)

    const milestoneSummary = {
      total: milestoneTotals._count._all,
      done: milestoneDoneCount,
      invoiced: milestoneInvoicedTotals._count._all,
      totalAmount: decimalToNumber(milestoneTotals._sum.amount),
      invoicedAmount: decimalToNumber(milestoneInvoicedTotals._sum.amount),
    }

    const expectedRevenue = Math.max(
      revenue,
      salesOrderTotal,
      milestoneSummary.totalAmount,
    )
    const expectedProfit = expectedRevenue - totalCost
    const recognizedProfit = revenue - totalCost

    return {
      projectId,
      projectName: project.name,
      projectCode: project.code,
      currency: project.currency,
      
      // Revenue
      revenue,
      salesOrderTotal,
      expectedRevenue,
      
      // Costs breakdown
      cost: totalCost,
      timesheetCost,
      expenseCost,
      vendorBillCost,
      purchaseOrderTotal,
      
      // Profitability
      profit: expectedProfit,
      profitMargin: expectedRevenue > 0 ? (expectedProfit / expectedRevenue) * 100 : 0,
      expectedProfit,
      expectedProfitMargin: expectedRevenue > 0 ? (expectedProfit / expectedRevenue) * 100 : 0,
      recognizedProfit,
      recognizedProfitMargin: revenue > 0 ? (recognizedProfit / revenue) * 100 : 0,
      
      // Budget
      budgetAmount,
      budgetUsed: budgetAmount > 0 ? budgetUsed : 0,
      budgetRemaining: budgetAmount > 0 ? budgetAmount - totalCost : 0,
      
      // Milestones
      milestones: milestoneSummary,
      
      // Counts
      counts: {
        invoices: invoiceCount,
        timesheets: timesheetCount,
        expenses: expenseCount,
        vendorBills: vendorBillCount,
        salesOrders: salesOrderCount,
        purchaseOrders: purchaseOrderCount,
      },
    }
  }

  /**
   * Get detailed project overview with all related documents
   * Supports all three scenarios
   */
  async getProjectOverview(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
        teamMembers: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
        tasks: {
          include: { assignee: { select: { id: true, fullName: true } } },
        },
        milestones: { orderBy: { createdAt: 'asc' } },
        salesOrders: { include: { lines: true } },
        purchaseOrders: { include: { lines: true } },
        customerInvoices: { include: { invoiceLines: true } },
        vendorBills: { include: { billLines: true } },
        timesheets: {
          include: { user: { select: { fullName: true } }, task: true },
          orderBy: { workDate: 'desc' },
          take: 50, // Limit to recent 50
        },
        expenses: {
          include: { user: { select: { fullName: true } } },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!project) return null

    const financials = await this.getFinancials(projectId)

    return {
      project,
      financials,
    }
  }
}

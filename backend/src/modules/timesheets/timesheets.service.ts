import { BadRequestException, Injectable } from "@nestjs/common"
import  { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class TimesheetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId?: string) {
    const durationHours = Number(data.durationHours || 0)
    const hourlyRate = Number(data.hourlyRate || 0)
    const workDate = data.workDate ? new Date(data.workDate) : null

    if (!userId) throw new BadRequestException("Authenticated user is required")
    if (!data.projectId) throw new BadRequestException("Project is required")
    if (!workDate || Number.isNaN(workDate.getTime())) throw new BadRequestException("Valid work date is required")
    if (durationHours <= 0) throw new BadRequestException("Duration must be greater than zero")
    if (hourlyRate < 0) throw new BadRequestException("Hourly rate cannot be negative")

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

  async findAll(filters?: any) {
    return this.prisma.timesheet.findMany({
      where: filters,
      include: { user: true, project: true, task: true },
    })
  }

  async findById(id: string) {
    return this.prisma.timesheet.findUnique({
      where: { id },
      include: { user: true, project: true, task: true },
    })
  }

  async approve(id: string) {
    return this.prisma.timesheet.update({
      where: { id },
      data: { status: "APPROVED" },
    })
  }

  async reject(id: string) {
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

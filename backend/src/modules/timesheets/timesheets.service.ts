import { Injectable } from "@nestjs/common"
import  { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class TimesheetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.timesheet.create({
      data: {
        ...data,
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

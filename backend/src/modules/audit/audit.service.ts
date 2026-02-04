import { Injectable } from "@nestjs/common"
import  { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(action: string, entityType: string, entityId: string, details?: string) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        details,
      },
    })
  }
}

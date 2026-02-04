import { Injectable } from "@nestjs/common"
import  { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.attachment.create({
      data,
    })
  }

  async findById(id: string) {
    return this.prisma.attachment.findUnique({
      where: { id },
    })
  }
}

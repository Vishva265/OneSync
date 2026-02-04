import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true },
    })
  }

  async findById(id: string) {
    if (!id) throw new BadRequestException("User id is required")
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, fullName: true, role: true,
        defaultHourlyRate: true, timezone: true, status: true, createdAt: true,
      },
    })
    if (!user) throw new NotFoundException("User not found")
    return user
  }

  // used by /users/me
  async findOne(where: { id?: string; email?: string }) {
    if (!where.id && !where.email) {
      throw new BadRequestException("Provide id or email")
    }
    const user = await this.prisma.user.findUnique({
      where: where.id ? { id: where.id } : { email: where.email! },
      select: {
        id: true, email: true, fullName: true, role: true,
        defaultHourlyRate: true, timezone: true, status: true, createdAt: true,
      },
    })
    if (!user) throw new NotFoundException("User not found")
    return user
  }



  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    })
  }
}

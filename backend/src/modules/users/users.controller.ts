import { Controller, Get, UseGuards, Req, Param, BadRequestException } from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import { UsersService } from "./users.service"

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll()
  }

  @Get("me")
  async getMe(@Req() req: any) {
    const { id, sub, userId, email } = req.user || {}
    const where: { id?: string; email?: string } = {}
    if (id || sub || userId) where.id = id ?? sub ?? userId
    else if (email) where.email = email
    else throw new BadRequestException("JWT payload missing user identifier")

    return this.usersService.findOne(where)
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.usersService.findById(id)
  }
}

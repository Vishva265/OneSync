import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import { ExpensesService } from "./expenses.service"

@ApiTags("Expenses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/expenses")
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    const filters: any = {}
    if (query.project) filters.projectId = query.project
    if (query.projectId) filters.projectId = query.projectId
    if (query.user) filters.userId = query.user
    if (query.status) filters.status = query.status
    return this.expensesService.findAll(filters, req.user)
  }

  @Get("pending")
  async getPendingExpenses(@Query("projectId") projectId: string | undefined, @Req() req: any) {
    return this.expensesService.getPendingExpenses(projectId, req.user)
  }

  @Get("project/:projectId")
  async getByProject(@Param("projectId") projectId: string, @Req() req: any) {
    return this.expensesService.getByProject(projectId, req.user)
  }

  @Get(":id")
  async getById(@Param("id") id: string, @Req() req: any) {
    return this.expensesService.findById(id, req.user)
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.expensesService.create(body, req.user)
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: any, @Req() req: any) {
    return this.expensesService.update(id, body, req.user)
  }

  @Put(":id/approve")
  async approve(@Param("id") id: string, @Req() req: any) {
    return this.expensesService.approve(id, req.user)
  }

  @Put(":id/reject")
  async reject(@Param("id") id: string, @Body() body: { reason?: string }, @Req() req: any) {
    return this.expensesService.reject(id, body.reason, req.user)
  }

  @Put(":id/reimburse")
  async reimburse(@Param("id") id: string, @Req() req: any) {
    return this.expensesService.reimburse(id, req.user)
  }
}

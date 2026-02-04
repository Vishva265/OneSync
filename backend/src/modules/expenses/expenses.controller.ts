import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import  { ExpensesService } from "./expenses.service"

@ApiTags("Expenses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/expenses")
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Get()
  async findAll(@Query() query: any) {
    const filters: any = {}
    if (query.project) filters.projectId = query.project
    if (query.status) filters.status = query.status
    return this.expensesService.findAll(filters)
  }

  @Get('pending')
  async getPendingExpenses(@Query('projectId') projectId?: string) {
    return this.expensesService.getPendingExpenses(projectId);
  }

  @Get('project/:projectId')
  async getByProject(@Param('projectId') projectId: string) {
    return this.expensesService.getByProject(projectId);
  }

  @Post()
  async create(@Body() body: any) {
    return this.expensesService.create(body);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    return this.expensesService.approve(id);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.expensesService.reject(id, body.reason);
  }

  @Put(':id/reimburse')
  async reimburse(@Param('id') id: string) {
    return this.expensesService.reimburse(id);
  }
}

import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import { TimesheetsService } from "./timesheets.service"

@ApiTags("Timesheets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/timesheets")
export class TimesheetsController {
  constructor(private timesheetsService: TimesheetsService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    const filters: any = {}
    if (query.user) filters.userId = query.user
    if (query.project) filters.projectId = query.project
    if (query.status) filters.status = query.status
    return this.timesheetsService.findAll(filters, req.user)
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: any) {
    return this.timesheetsService.findById(id, req.user)
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.timesheetsService.create(body, req.user)
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: any, @Req() req: any) {
    return this.timesheetsService.update(id, body, req.user)
  }

  @Put(":id/approve")
  async approve(@Param("id") id: string, @Req() req: any) {
    return this.timesheetsService.approve(id, req.user)
  }

  @Put(":id/reject")
  async reject(@Param("id") id: string, @Req() req: any) {
    return this.timesheetsService.reject(id, req.user)
  }
}

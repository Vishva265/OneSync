// src/modules/timesheets/timesheets.controller.ts
import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, Query } from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
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

    // Optional: default TEAM_MEMBER to their own timesheets if no user filter supplied
    if (!filters.userId && req?.user?.role === "TEAM_MEMBER") {
      filters.userId = req.user.id
    }

    return this.timesheetsService.findAll(filters)
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.timesheetsService.findById(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.timesheetsService.create(body)
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: any) {
    // TODO: implement real update
    return this.timesheetsService.findById(id)
  }

  @Put(":id/approve")
  async approve(@Param("id") id: string) {
    return this.timesheetsService.approve(id)
  }

  @Put(":id/reject")
  async reject(@Param("id") id: string) {
    return this.timesheetsService.reject(id)
  }
}

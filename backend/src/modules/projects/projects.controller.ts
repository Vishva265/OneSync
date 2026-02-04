import { Controller, Get, Post, Put, Param, Body, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import  { ProjectsService } from "./projects.service"
import { MilestonesService } from "./milestones.service"

@ApiTags("Projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/projects")
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private milestonesService: MilestonesService,
  ) {}

  @Get()
  async findAll() {
    return this.projectsService.findAll()
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Get(':id/financials')
  async getFinancials(@Param('id') id: string) {
    return this.projectsService.getFinancials(id);
  }

  @Get(':id/overview')
  async getOverview(@Param('id') id: string) {
    return this.projectsService.getProjectOverview(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.projectsService.create(body);
  }

  @Put(":id")
  async update(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(id, body)
  }

  // Milestone endpoints
  @Get(':id/milestones')
  async getMilestones(@Param('id') projectId: string) {
    return this.milestonesService.getMilestonesByProject(projectId);
  }

  @Post(':id/milestones')
  async createMilestone(@Param('id') projectId: string, @Body() body: any) {
    return this.milestonesService.createMilestone({ projectId, ...body });
  }

  @Put('milestones/:milestoneId')
  async updateMilestone(@Param('milestoneId') milestoneId: string, @Body() body: any) {
    return this.milestonesService.updateMilestone(milestoneId, body);
  }

  @Post('milestones/:milestoneId/mark-done')
  async markMilestoneDone(@Param('milestoneId') milestoneId: string) {
    return this.milestonesService.markMilestoneDone(milestoneId);
  }

  @Post('milestones/:milestoneId/create-invoice')
  async createInvoiceFromMilestone(@Param('milestoneId') milestoneId: string) {
    return this.milestonesService.createInvoiceFromMilestone(milestoneId);
  }
}

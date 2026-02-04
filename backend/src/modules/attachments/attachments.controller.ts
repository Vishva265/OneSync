import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import  { AttachmentsService } from "./attachments.service"

@ApiTags("Attachments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/attachments")
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.attachmentsService.findById(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.attachmentsService.create(body);
  }
}

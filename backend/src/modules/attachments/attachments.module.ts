import { Module } from "@nestjs/common"
import { AttachmentsService } from "./attachments.service"
import { AttachmentsController } from "./attachments.controller"
import { PrismaModule } from "@/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [AttachmentsService],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}

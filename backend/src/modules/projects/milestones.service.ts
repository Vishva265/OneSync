import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a milestone for a project
   */
  async createMilestone(data: {
    projectId: string;
    name: string;
    description?: string;
    amount: number;
    dueDate?: Date | string;
  }) {
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.milestone.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        amount: data.amount,
        status: 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  /**
   * Get all milestones for a project
   */
  async getMilestonesByProject(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Mark a milestone as done
   */
  async markMilestoneDone(milestoneId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'DONE',
        completedDate: new Date(),
      },
    });
  }

  /**
   * Create invoice from a completed milestone
   * Scenario 8.1: When milestone is done, create customer invoice
   */
  async createInvoiceFromMilestone(milestoneId: string) {
    return this.prisma.$transaction(async (tx) => {
      const milestone = await tx.milestone.findUnique({
        where: { id: milestoneId },
        include: { project: true },
      });

      if (!milestone) {
        throw new NotFoundException('Milestone not found');
      }

      if (milestone.status !== 'DONE') {
        throw new BadRequestException('Milestone must be marked as DONE before invoicing');
      }

      if (milestone.invoiced) {
        throw new BadRequestException('Milestone already invoiced');
      }

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = await tx.customerInvoice.create({
        data: {
          number: invoiceNumber,
          projectId: milestone.projectId,
          status: 'DRAFT',
          totalAmount: milestone.amount,
          currency: milestone.project.currency,
          notes: `Invoice for milestone: ${milestone.name}`,
        },
      });

      // Create invoice line
      await tx.invoiceLine.create({
        data: {
          invoiceId: invoice.id,
          description: `Milestone: ${milestone.name}${milestone.description ? ' - ' + milestone.description : ''}`,
          quantity: 1,
          unitPrice: milestone.amount,
          amount: milestone.amount,
        },
      });

      // Mark milestone as invoiced
      await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          invoiced: true,
          invoiceId: invoice.id,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'INVOICE_CREATED',
          entityType: 'MILESTONE',
          entityId: milestoneId,
          details: `Created invoice ${invoiceNumber} from milestone ${milestone.name}`,
        },
      });

      return {
        invoice,
        milestone,
      };
    });
  }

  /**
   * Update milestone
   */
  async updateMilestone(milestoneId: string, data: {
    name?: string;
    description?: string;
    amount?: number;
    status?: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
    dueDate?: Date | string;
  }) {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    
    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });
  }
}

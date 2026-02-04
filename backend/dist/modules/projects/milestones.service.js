"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestonesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MilestonesService = class MilestonesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create a milestone for a project
     */
    async createMilestone(data) {
        const project = await this.prisma.project.findUnique({
            where: { id: data.projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
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
    async getMilestonesByProject(projectId) {
        return this.prisma.milestone.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
        });
    }
    /**
     * Mark a milestone as done
     */
    async markMilestoneDone(milestoneId) {
        const milestone = await this.prisma.milestone.findUnique({
            where: { id: milestoneId },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
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
    async createInvoiceFromMilestone(milestoneId) {
        return this.prisma.$transaction(async (tx) => {
            const milestone = await tx.milestone.findUnique({
                where: { id: milestoneId },
                include: { project: true },
            });
            if (!milestone) {
                throw new common_1.NotFoundException('Milestone not found');
            }
            if (milestone.status !== 'DONE') {
                throw new common_1.BadRequestException('Milestone must be marked as DONE before invoicing');
            }
            if (milestone.invoiced) {
                throw new common_1.BadRequestException('Milestone already invoiced');
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
    async updateMilestone(milestoneId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.amount !== undefined)
            updateData.amount = data.amount;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.dueDate !== undefined)
            updateData.dueDate = new Date(data.dueDate);
        return this.prisma.milestone.update({
            where: { id: milestoneId },
            data: updateData,
        });
    }
};
exports.MilestonesService = MilestonesService;
exports.MilestonesService = MilestonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MilestonesService);
//# sourceMappingURL=milestones.service.js.map
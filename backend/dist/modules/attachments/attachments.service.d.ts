import { PrismaService } from "@/prisma/prisma.service";
export declare class AttachmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        taskId: string | null;
        invoiceId: string | null;
        timesheetId: string | null;
        expenseId: string | null;
        billId: string | null;
        entityType: string;
        entityId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        s3Url: string;
        createdById: string;
    }>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        taskId: string | null;
        invoiceId: string | null;
        timesheetId: string | null;
        expenseId: string | null;
        billId: string | null;
        entityType: string;
        entityId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        s3Url: string;
        createdById: string;
    } | null>;
}
//# sourceMappingURL=attachments.service.d.ts.map
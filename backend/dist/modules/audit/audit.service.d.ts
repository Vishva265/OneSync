import { PrismaService } from "@/prisma/prisma.service";
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(action: string, entityType: string, entityId: string, details?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        details: string | null;
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map
import { PrismaService } from "@/prisma/prisma.service";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
    }[]>;
    findById(id: string): Promise<{
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
        timezone: string;
        createdAt: Date;
    }>;
    findOne(where: {
        id?: string;
        email?: string;
    }): Promise<{
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
        timezone: string;
        createdAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
}
//# sourceMappingURL=users.service.d.ts.map
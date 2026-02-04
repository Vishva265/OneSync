import { UsersService } from "./users.service";
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
    }[]>;
    getMe(req: any): Promise<{
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal;
        timezone: string;
        createdAt: Date;
    }>;
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
}
//# sourceMappingURL=users.controller.d.ts.map
export declare enum UserRole {
    ADMIN = "ADMIN",
    PROJECT_MANAGER = "PROJECT_MANAGER",
    TEAM_MEMBER = "TEAM_MEMBER",
    FINANCE = "FINANCE"
}
export declare class SignUpDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}
//# sourceMappingURL=sign-up.dto.d.ts.map
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signUp(signUpDto: SignUpDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    signIn(signInDto: SignInDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    private generateToken;
}
//# sourceMappingURL=auth.service.d.ts.map
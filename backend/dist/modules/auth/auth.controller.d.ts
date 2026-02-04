import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signUp(signUpDto: SignUpDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    signIn(signInDto: SignInDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map
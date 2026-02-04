import { Controller, Post, Body } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { SignUpDto } from "./dto/sign-up.dto"
import { SignInDto } from "./dto/sign-in.dto"

@ApiTags("Auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("sign-up")
  @ApiOperation({ summary: "Sign up a new user" })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @Post("sign-in")
  @ApiOperation({ summary: "Sign in user" })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto)
  }

  @Post("logout")
  @ApiOperation({ summary: "Sign out user" })
  async logout() {
    return { message: "Logged out successfully" }
  }
}

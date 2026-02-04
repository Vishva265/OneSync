import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { PrismaService } from "@/prisma/prisma.service"
import { SignUpDto, UserRole } from "./dto/sign-up.dto"
import { SignInDto } from "./dto/sign-in.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signUpDto.email },
    })
    if (existingUser) {
      throw new BadRequestException("Email already in use")
    }

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10)

    // (Optional) extra guard: ensure role is within enum
    const role: UserRole =
      Object.values(UserRole).includes(signUpDto.role as UserRole)
        ? (signUpDto.role as UserRole)
        : UserRole.TEAM_MEMBER

    const user = await this.prisma.user.create({
      data: {
        email: signUpDto.email,
        fullName: signUpDto.fullName,
        passwordHash: hashedPassword,
        role,                 // <- use selected role
        status: "ACTIVE",
      },
      select: { id: true, email: true, fullName: true, role: true },
    })

    return this.generateToken(user)
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: signInDto.email },
    })

    if (!user) throw new UnauthorizedException("Invalid credentials")

    const isPasswordValid = await bcrypt.compare(signInDto.password, user.passwordHash)
    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials")

    return this.generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    })
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    }
  }
}

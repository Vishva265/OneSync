// src/modules/auth/dto/sign-up.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator"

export enum UserRole {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_MEMBER = "TEAM_MEMBER",
  FINANCE = "FINANCE",
}

export class SignUpDto {
  @IsEmail() email: string

  @MinLength(6) password: string

  @IsNotEmpty() fullName: string

  @IsEnum(UserRole)
  role: UserRole // required; you can make optional and default if you prefer
}

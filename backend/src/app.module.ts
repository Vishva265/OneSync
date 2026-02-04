import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { PrismaModule } from "./prisma/prisma.module"
import { AuthModule } from "./modules/auth/auth.module"
import { UsersModule } from "./modules/users/users.module"
import { ProjectsModule } from "./modules/projects/projects.module"
import { TasksModule } from "./modules/tasks/tasks.module"
import { TimesheetsModule } from "./modules/timesheets/timesheets.module"
import { ExpensesModule } from "./modules/expenses/expenses.module"
import { FinanceModule } from "./modules/finance/finance.module"
import { AttachmentsModule } from "./modules/attachments/attachments.module"
import { AuditModule } from "./modules/audit/audit.module"
import { AnalyticsModule } from "./modules/analytics/analytics.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret-key",
      signOptions: { expiresIn: "24h" },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    AnalyticsModule,
    TasksModule,
    TimesheetsModule,
    ExpensesModule,
    FinanceModule,
    AttachmentsModule,
    AuditModule,
  ],
})
export class AppModule {}

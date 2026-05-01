import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

const devUsers = [
  {
    email: "admin@onesync.local",
    legacyEmails: ["admin@onesync.com", "admin@oneflow.com"],
    password: "admin@123",
    fullName: "Admin User",
    role: "ADMIN" as const,
    defaultHourlyRate: 100,
  },
  {
    email: "pm@onesync.local",
    legacyEmails: ["pm@oneflow.local"],
    password: "pm@123",
    fullName: "Project Manager",
    role: "PROJECT_MANAGER" as const,
    defaultHourlyRate: 80,
  },
  {
    email: "finance@onesync.local",
    legacyEmails: ["finance@oneflow.local"],
    password: "finance@123",
    fullName: "Finance Officer",
    role: "FINANCE" as const,
    defaultHourlyRate: 75,
  },
  {
    email: "team@onesync.local",
    legacyEmails: ["team@oneflow.local"],
    password: "team@123",
    fullName: "Team Member",
    role: "TEAM_MEMBER" as const,
    defaultHourlyRate: 50,
  },
]

async function repairDevUser(user: (typeof devUsers)[number]) {
  const passwordHash = await bcrypt.hash(user.password, 10)
  const existing = await prisma.user.findUnique({
    where: { email: user.email },
  })
  const legacyUser = existing
    ? null
    : await prisma.user.findFirst({
    where: {
      email: {
        in: user.legacyEmails,
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const data = {
    email: user.email,
    passwordHash,
    fullName: user.fullName,
    role: user.role,
    status: "ACTIVE" as const,
    defaultHourlyRate: user.defaultHourlyRate,
    timezone: "UTC",
  }

  const userToRepair = existing ?? legacyUser

  if (userToRepair) {
    await prisma.user.update({
      where: { id: userToRepair.id },
      data,
    })
    console.log(`Repaired ${user.email}`)
    return
  }

  await prisma.user.create({ data })
  console.log(`Created ${user.email}`)
}

async function main() {
  console.log("Repairing dev login users...")

  for (const user of devUsers) {
    await repairDevUser(user)
  }

  console.log("\nTest Credentials:")
  console.log("  Admin:   admin@onesync.local / admin@123")
  console.log("  PM:      pm@onesync.local / pm@123")
  console.log("  Finance: finance@onesync.local / finance@123")
  console.log("  Team:    team@onesync.local / team@123")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

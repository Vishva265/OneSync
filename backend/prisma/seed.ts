import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Clear existing data (in order of dependencies)
  await prisma.auditLog.deleteMany()
  await prisma.billLine.deleteMany()
  await prisma.vendorBill.deleteMany()
  await prisma.invoiceLine.deleteMany()
  await prisma.customerInvoice.deleteMany()
  await prisma.purchaseOrderLine.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.salesOrderLine.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.timesheet.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectTeamMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const adminPassword = await bcrypt.hash("admin@123", 10)
  const admin = await prisma.user.create({
    data: {
      email: "admin@oneflow.com",
      passwordHash: adminPassword,
      fullName: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
      defaultHourlyRate: 100,
      timezone: "UTC",
    },
  })

  const pmPassword = await bcrypt.hash("pm@123", 10)
  const pm = await prisma.user.create({
    data: {
      email: "pm@oneflow.local",
      passwordHash: pmPassword,
      fullName: "Project Manager",
      role: "PROJECT_MANAGER",
      status: "ACTIVE",
      defaultHourlyRate: 80,
      timezone: "UTC",
    },
  })

  const financePassword = await bcrypt.hash("finance@123", 10)
  const finance = await prisma.user.create({
    data: {
      email: "finance@oneflow.local",
      passwordHash: financePassword,
      fullName: "Finance Officer",
      role: "FINANCE",
      status: "ACTIVE",
      defaultHourlyRate: 75,
      timezone: "UTC",
    },
  })

  const teamPassword = await bcrypt.hash("team@123", 10)
  const teamMember = await prisma.user.create({
    data: {
      email: "team@oneflow.local",
      passwordHash: teamPassword,
      fullName: "Team Member",
      role: "TEAM_MEMBER",
      status: "ACTIVE",
      defaultHourlyRate: 50,
      timezone: "UTC",
    },
  })

  // Create project
  const project = await prisma.project.create({
    data: {
      code: "ACME-001",
      name: "ACME Website Redesign",
      description: "Complete redesign of ACME Corp website",
      projectManagerId: pm.id,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
      budgetAmount: 150000,
      currency: "USD",
      status: "ACTIVE",
      projectType: "FIXED_PRICE",
      billableFlag: true,
      defaultHourlyRate: 60,
    },
  })

  // Add team member to project
  await prisma.projectTeamMember.create({
    data: {
      projectId: project.id,
      userId: teamMember.id,
      role: "DEVELOPER",
    },
  })

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Design homepage mockups",
      description: "Create Figma mockups for homepage",
      state: "DONE",
      priority: "HIGH",
      assigneeId: teamMember.id,
      estimateHours: 16,
      dueDate: new Date("2025-02-15"),
    },
  })

  const task2 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Develop frontend components",
      description: "Build React components for homepage",
      state: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: teamMember.id,
      estimateHours: 40,
      dueDate: new Date("2025-03-15"),
    },
  })

  // Create timesheets
  const timesheet1 = await prisma.timesheet.create({
    data: {
      userId: teamMember.id,
      projectId: project.id,
      taskId: task1.id,
      workDate: new Date("2025-02-10"),
      durationHours: 8,
      hourlyRate: 60,
      amount: 480, // 8 * 60
      billable: true,
      notes: "Worked on homepage design",
      status: "APPROVED",
      invoiced: false,
    },
  })

  const timesheet2 = await prisma.timesheet.create({
    data: {
      userId: teamMember.id,
      projectId: project.id,
      taskId: task1.id,
      workDate: new Date("2025-02-11"),
      durationHours: 8,
      hourlyRate: 60,
      amount: 480, // 8 * 60
      billable: true,
      notes: "Completed design mockups",
      status: "APPROVED",
      invoiced: false,
    },
  })

  // Create products
  const product = await prisma.product.create({
    data: {
      sku: "WEB-DESIGN",
      name: "Website Design & Development",
      description: "Full website design and development service",
      unitPrice: 5000,
      type: "SERVICE",
    },
  })

  // Create sales order
  const salesOrder = await prisma.salesOrder.create({
    data: {
      number: "SO-2025-001",
      projectId: project.id,
      customerId: "ACME-CORP",
      customerName: "ACME Corporation",
      status: "POSTED",
      totalAmount: 150000,
      currency: "USD",
    },
  })

  // Create sales order lines
  await prisma.salesOrderLine.create({
    data: {
      soId: salesOrder.id,
      productId: product.id,
      description: "Website Redesign - 150 hours @ $1000/day",
      quantity: 30,
      unitPrice: 5000,
      amount: 150000,
    },
  })

  // Create expense
  const expense = await prisma.expense.create({
    data: {
      userId: teamMember.id,
      projectId: project.id,
      amount: 500,
      currency: "USD",
      date: new Date("2025-02-12"),
      category: "TOOLS",
      billable: true,
      approved: true,
      reimbursed: false,
      notes: "Figma and design tool licenses",
    },
  })

  console.log("✓ Seed data created successfully!")
  console.log("\n📝 Test Credentials:")
  console.log("  Admin:   admin@oneflow.local / admin@123")
  console.log("  PM:      pm@oneflow.local / pm@123")
  console.log("  Finance: finance@oneflow.local / finance@123")
  console.log("  Team:    team@oneflow.local / team@123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

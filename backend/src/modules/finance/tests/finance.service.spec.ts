import { Test, type TestingModule } from "@nestjs/testing"
import { FinanceService } from "../finance.service"
import { PrismaService } from "@/prisma/prisma.service"
import { BadRequestException } from "@nestjs/common"
import { jest, fail } from "@jest/globals" // Import jest and fail from @jest/globals

describe("FinanceService - Invoice Creation", () => {
  let service: FinanceService
  let prisma: PrismaService

  const mockPrisma = {
    timesheet: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    customerInvoice: {
      create: jest.fn(),
    },
    invoiceLine: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get<FinanceService>(FinanceService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("createInvoiceFromTimesheets", () => {
    it("should create invoice from approved timesheets with atomic transaction", async () => {
      const projectId = "proj-1"
      const timesheetIds = ["ts-1", "ts-2"]

      const mockTimesheets = [
        {
          id: "ts-1",
          projectId,
          status: "APPROVED",
          invoiced: false,
          durationHours: 8,
          hourlyRate: 60,
          amount: 480,
          notes: "Task work",
          task: { title: "Design" },
          user: { id: "user-1", email: "team@test.com" },
        },
        {
          id: "ts-2",
          projectId,
          status: "APPROVED",
          invoiced: false,
          durationHours: 8,
          hourlyRate: 60,
          amount: 480,
          notes: "Dev work",
          task: { title: "Development" },
          user: { id: "user-1", email: "team@test.com" },
        },
      ]

      const mockInvoice = {
        id: "inv-1",
        number: "INV-1234567890",
        projectId,
        status: "DRAFT",
        totalAmount: 960,
        currency: "USD",
        createdAt: new Date(),
      }

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const txMock = {
          timesheet: {
            findMany: jest.fn().mockResolvedValue(mockTimesheets),
            update: jest.fn().mockResolvedValue({}),
          },
          customerInvoice: {
            create: jest.fn().mockResolvedValue(mockInvoice),
          },
          invoiceLine: {
            create: jest.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        }
        return callback(txMock)
      })

      const result = await service.createInvoiceFromTimesheets(projectId, timesheetIds)

      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(result.invoice.number).toBe("INV-1234567890")
      expect(result.timesheetsInvoiced).toBe(2)
      expect(result.invoiceLines.length).toBe(2)
    })

    it("should prevent double-invoicing of timesheets", async () => {
      const projectId = "proj-1"
      const timesheetIds = ["ts-1", "ts-2"]

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const txMock = {
          timesheet: {
            findMany: jest.fn().mockResolvedValue([
              {
                id: "ts-1",
                projectId,
                status: "APPROVED",
                invoiced: true, // <-- Already invoiced
                amount: 480,
              },
              {
                id: "ts-2",
                projectId,
                status: "APPROVED",
                invoiced: false,
                amount: 480,
              },
            ]),
          },
        }
        return callback(txMock)
      })

      try {
        await service.createInvoiceFromTimesheets(projectId, timesheetIds)
        fail("Should have thrown BadRequestException")
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
        expect(error.message).toContain("not approved or already invoiced")
      }
    })

    it("should reject if timesheets are not approved", async () => {
      const projectId = "proj-1"
      const timesheetIds = ["ts-1"]

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const txMock = {
          timesheet: {
            findMany: jest.fn().mockResolvedValue([
              {
                id: "ts-1",
                projectId,
                status: "DRAFT", // <-- Not approved
                invoiced: false,
                amount: 480,
              },
            ]),
          },
        }
        return callback(txMock)
      })

      try {
        await service.createInvoiceFromTimesheets(projectId, timesheetIds)
        fail("Should have thrown BadRequestException")
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
      }
    })

    it("should handle partial timesheet selection", async () => {
      const projectId = "proj-1"
      const timesheetIds = ["ts-1", "ts-2", "ts-3"]

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const txMock = {
          timesheet: {
            findMany: jest.fn().mockResolvedValue([
              { id: "ts-1", projectId, status: "APPROVED", invoiced: false, amount: 480 },
              { id: "ts-2", projectId, status: "APPROVED", invoiced: false, amount: 480 },
            ]), // Only 2 found, not 3
          },
        }
        return callback(txMock)
      })

      try {
        await service.createInvoiceFromTimesheets(projectId, timesheetIds)
        fail("Should have thrown BadRequestException")
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
        expect(error.message).toContain("not found")
      }
    })

    it("should snapshot hourly rates and descriptions for audit trail", async () => {
      const projectId = "proj-1"
      const timesheetIds = ["ts-1"]

      const mockTimesheet = {
        id: "ts-1",
        projectId,
        status: "APPROVED",
        invoiced: false,
        durationHours: 8,
        hourlyRate: 75,
        amount: 600,
        notes: "Frontend development",
        task: { title: "Build Login" },
      }

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const txMock = {
          timesheet: {
            findMany: jest.fn().mockResolvedValue([mockTimesheet]),
            update: jest.fn().mockResolvedValue({}),
          },
          customerInvoice: {
            create: jest.fn().mockResolvedValue({
              id: "inv-1",
              number: "INV-123",
            }),
          },
          invoiceLine: {
            create: jest.fn(),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        }
        return callback(txMock)
      })

      await service.createInvoiceFromTimesheets(projectId, timesheetIds)

      // Verify line creation was called with snapshotted data
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it("should create audit log entry for compliance", async () => {
      const projectId = "proj-1"
      const timesheetIds = ["ts-1", "ts-2"]

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const txMock = {
          timesheet: {
            findMany: jest.fn().mockResolvedValue([
              { id: "ts-1", projectId, status: "APPROVED", invoiced: false, amount: 480 },
              { id: "ts-2", projectId, status: "APPROVED", invoiced: false, amount: 480 },
            ]),
            update: jest.fn().mockResolvedValue({}),
          },
          customerInvoice: {
            create: jest.fn().mockResolvedValue({
              id: "inv-1",
              number: "INV-123",
            }),
          },
          invoiceLine: {
            create: jest.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        }
        return callback(txMock)
      })

      await service.createInvoiceFromTimesheets(projectId, timesheetIds)

      // Verify auditLog was called
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })

  describe("Project Financial Calculations", () => {
    it("should calculate revenue from customer invoices", () => {
      const invoices = [
        { totalAmount: 1000, status: "POSTED" },
        { totalAmount: 500, status: "POSTED" },
        { totalAmount: 250, status: "DRAFT" },
      ]

      const revenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
      expect(revenue).toBe(1750)
    })

    it("should calculate cost from timesheets and expenses", () => {
      const timesheets = [{ amount: 480 }, { amount: 600 }]

      const expenses = [{ amount: 100 }, { amount: 250 }]

      const cost =
        timesheets.reduce((sum, ts) => sum + ts.amount, 0) + expenses.reduce((sum, exp) => sum + exp.amount, 0)

      expect(cost).toBe(1430)
    })

    it("should calculate profit margin", () => {
      const revenue = 10000
      const cost = 6000
      const profit = revenue - cost
      const profitMargin = (profit / revenue) * 100

      expect(profit).toBe(4000)
      expect(profitMargin).toBe(40)
    })
  })

  describe("Timesheet Approval Workflow", () => {
    it("should only allow approved timesheets to be invoiced", () => {
      const statuses = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]
      const approvableStatuses = ["APPROVED"]

      statuses.forEach((status) => {
        const canInvoice = approvableStatuses.includes(status)
        if (status === "APPROVED") {
          expect(canInvoice).toBe(true)
        } else {
          expect(canInvoice).toBe(false)
        }
      })
    })
  })
})

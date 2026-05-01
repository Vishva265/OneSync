import { Injectable, BadRequestException } from "@nestjs/common";
import  { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private decimalToNumber(value: any) {
    return value?.toNumber?.() ?? Number(value) ?? 0;
  }

  private documentNumber(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async createInvoiceFromTimesheets(projectId: string, timesheetIds: string[]) {
    return await this.prisma.$transaction(async (tx) => {
      // ✅ Validate all timesheets exist, are approved, and not already invoiced
      const timesheets = await tx.timesheet.findMany({
        where: { id: { in: timesheetIds }, projectId },
        include: { user: true, task: true },
      });

      if (timesheets.length !== timesheetIds.length) {
        throw new BadRequestException("Some timesheets not found");
      }

      const invalidTimesheets = timesheets.filter(
        (ts) => ts.status !== "APPROVED" || ts.invoiced,
      );

      if (invalidTimesheets.length > 0) {
        throw new BadRequestException(
          "Some timesheets are not approved or already invoiced",
        );
      }

      // ✅ Safely sum Prisma.Decimal or number
      const totalAmount = timesheets.reduce(
        (sum, ts) =>
          sum +
          (typeof ts.amount === "object" && "toNumber" in ts.amount
            ? ts.amount.toNumber()
            : ts.amount || 0),
        0,
      );

      const invoiceNumber = this.documentNumber("INV");

      // ✅ Create invoice
      const invoice = await tx.customerInvoice.create({
        data: {
          number: invoiceNumber,
          projectId,
          status: "DRAFT",
          totalAmount,
          currency: "USD",
        },
      });

      // ✅ Create invoice lines from timesheets (snapshot data)
      const invoiceLines = await Promise.all(
        timesheets.map((ts) =>
          tx.invoiceLine.create({
            data: {
              invoiceId: invoice.id,
              description: `Time: ${ts.task?.title || "Project Work"}${
                ts.notes ? " - " + ts.notes : ""
              }`,
              quantity: ts.durationHours ?? 0,
              unitPrice:
                typeof ts.hourlyRate === "object" &&
                "toNumber" in ts.hourlyRate
                  ? ts.hourlyRate.toNumber()
                  : ts.hourlyRate ?? 0,
              amount:
                typeof ts.amount === "object" && "toNumber" in ts.amount
                  ? ts.amount.toNumber()
                  : ts.amount ?? 0,
              timesheetId: ts.id,
            },
          }),
        ),
      );

      // ✅ Mark timesheets as invoiced
      await Promise.all(
        timesheetIds.map((id) =>
          tx.timesheet.update({
            where: { id },
            data: { invoiced: true, invoiceId: invoice.id },
          }),
        ),
      );

      // ✅ Create audit log
      await tx.auditLog.create({
        data: {
          action: "INVOICE_CREATED",
          entityType: "CUSTOMER_INVOICE",
          entityId: invoice.id,
          details: `Created invoice from ${timesheetIds.length} timesheets`,
          createdAt: new Date(),
        },
      });

      return {
        invoice: {
          id: invoice.id,
          number: invoice.number,
          status: invoice.status,
          totalAmount:
            typeof invoice.totalAmount === "object" &&
            "toNumber" in invoice.totalAmount
              ? invoice.totalAmount.toNumber()
              : invoice.totalAmount,
          createdAt: invoice.createdAt,
        },
        invoiceLines: invoiceLines.map((line) => ({
          id: line.id,
          description: line.description,
          quantity: line.quantity,
          unitPrice:
            typeof line.unitPrice === "object" && "toNumber" in line.unitPrice
              ? line.unitPrice.toNumber()
              : line.unitPrice,
          amount:
            typeof line.amount === "object" && "toNumber" in line.amount
              ? line.amount.toNumber()
              : line.amount,
        })),
        timesheetsInvoiced: timesheetIds.length,
      };
    });
  }

  async getSalesOrders(filters?: any) {
    return this.prisma.salesOrder.findMany({
      where: filters,
      include: { project: true, lines: true },
    });
  }

  async createSalesOrder(data: any) {
    // Expect data: { customerName, notes?, date?, lines: [{ productName, quantity, unitPrice }] }
    const { customerName, notes, date, lines = [] } = data;

    // Compute subtotals and total
    const preparedLines = (lines || []).map((l: any) => {
      const qty = Number(l.quantity || 0);
      const price = Number(l.unitPrice || l.price || 0);
      const subtotal = qty * price;
      return {
        productName: l.productName || l.name || 'Unknown',
        quantity: qty,
        unitPrice: price,
        amount: subtotal,
      };
    });

    const totalAmount = preparedLines.reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0);

    // Create SO with lines in a transaction
    return this.prisma.$transaction(async (tx) => {
      const soNumber = this.documentNumber("SO");
      const so = await tx.salesOrder.create({
        data: {
          number: soNumber,
          projectId: data.projectId || null,
          customerId: data.customerId || null,
          customerName,
          status: 'POSTED',
          totalAmount,
          currency: 'USD',
          createdAt: date ? new Date(date) : undefined,
          updatedAt: new Date(),
        },
      });

      // Create lines
      for (const pl of preparedLines) {
        await tx.salesOrderLine.create({
          data: {
            soId: so.id,
            productId: null,
            description: pl.productName,
            quantity: pl.quantity,
            unitPrice: pl.unitPrice,
            amount: pl.amount,
          },
        });
      }

      // Return the created SO with its lines
      return tx.salesOrder.findUnique({ where: { id: so.id }, include: { lines: true } });
    });
  }

  async getSalesOrderById(id: string) {
    return this.prisma.salesOrder.findUnique({ where: { id }, include: { lines: true, project: true } });
  }

  // Purchase Orders
  async getPurchaseOrders(filters?: any) {
    return this.prisma.purchaseOrder.findMany({ where: filters, include: { project: true, lines: true } });
  }

  async getPurchaseOrderById(id: string) {
    return this.prisma.purchaseOrder.findUnique({ where: { id }, include: { lines: true, project: true } });
  }

  async createPurchaseOrder(data: any) {
    // Expect data: { vendorName, projectId?, lines: [{ description, quantity, unitPrice }] }
    const { vendorName, lines = [] } = data;

    const preparedLines = (lines || []).map((l: any) => {
      const qty = Number(l.quantity || 0);
      const price = Number(l.unitPrice || l.price || 0);
      const subtotal = qty * price;
      return {
        productId: l.productId || null,
        description: l.description || l.name || 'Item',
        quantity: qty,
        unitPrice: price,
        amount: subtotal,
      };
    });

    const totalAmount = preparedLines.reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0);

    return this.prisma.$transaction(async (tx) => {
      const poNumber = this.documentNumber("PO");
      const po = await tx.purchaseOrder.create({ data: { number: poNumber, projectId: data.projectId || null, vendorId: data.vendorId || null, vendorName: vendorName || null, status: 'DRAFT', totalAmount, currency: data.currency || 'USD' } });

      for (const pl of preparedLines) {
        await tx.purchaseOrderLine.create({ data: { poId: po.id, productId: pl.productId, description: pl.description, quantity: pl.quantity, unitPrice: pl.unitPrice, amount: pl.amount } });
      }

      return tx.purchaseOrder.findUnique({ where: { id: po.id }, include: { lines: true } });
    });
  }

  // Vendor Bills
  async getVendorBills(filters?: any) {
    return this.prisma.vendorBill.findMany({ where: filters, include: { project: true, billLines: true } });
  }

  async getVendorBillById(id: string) {
    return this.prisma.vendorBill.findUnique({ where: { id }, include: { billLines: true, project: true } });
  }

  async createVendorBillFromPo(poId: string, body: any) {
    // Body may contain number, dueDate, notes, currency, etc. If not provided, copy from PO
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({ where: { id: poId }, include: { lines: true } });
      if (!po) throw new BadRequestException('Purchase Order not found');

      const existingBill = await tx.vendorBill.findFirst({
        where: { sourcePo: po.id, status: { not: 'CANCELLED' } },
        select: { number: true },
      });
      if (existingBill) {
        throw new BadRequestException(`Purchase Order already has vendor bill ${existingBill.number}`);
      }

      const billNumber = body.number || this.documentNumber("BILL");
      const vendorBill = await tx.vendorBill.create({ data: { number: billNumber, projectId: po.projectId, sourcePo: po.id, vendorId: po.vendorId || null, vendorName: po.vendorName || null, status: 'DRAFT', totalAmount: typeof po.totalAmount === 'object' && 'toNumber' in po.totalAmount ? po.totalAmount.toNumber() : po.totalAmount, currency: po.currency || 'USD', dueDate: body.dueDate ? new Date(body.dueDate) : undefined, notes: body.notes || undefined } });

      const createdLines: any[] = [];
      for (const line of po.lines) {
        const cl = await tx.billLine.create({ data: { billId: vendorBill.id, description: line.description, quantity: typeof line.quantity === 'object' && 'toNumber' in line.quantity ? line.quantity.toNumber() : line.quantity, unitPrice: typeof line.unitPrice === 'object' && 'toNumber' in line.unitPrice ? line.unitPrice.toNumber() : line.unitPrice, amount: typeof line.amount === 'object' && 'toNumber' in line.amount ? line.amount.toNumber() : line.amount } });
        createdLines.push(cl);
      }

      // Update PO status to indicate billed - map to DocumentStatus PAID or POSTED? We'll set to POSTED or keep DRAFT until bill paid. User requested 'BILLED' which isn't in enum; use POSTED as indicator.
      await tx.purchaseOrder.update({ where: { id: poId }, data: { status: 'POSTED' } });

      await tx.auditLog.create({ data: { action: 'VENDOR_BILL_CREATED', entityType: 'VENDOR_BILL', entityId: vendorBill.id, details: `Created vendor bill from PO ${po.number}`, createdAt: new Date() } });

      return { vendorBill, billLines: createdLines };
    });
  }

  async createInvoiceFromSalesOrder(soId: string) {
    return this.prisma.$transaction(async (tx) => {
      const so = await tx.salesOrder.findUnique({ where: { id: soId }, include: { lines: true } });
      if (!so) throw new BadRequestException('Sales Order not found');

      const existingInvoice = await tx.customerInvoice.findFirst({
        where: { sourceSoId: so.id, status: { not: 'CANCELLED' } },
        select: { number: true },
      });
      if (existingInvoice) {
        throw new BadRequestException(`Sales Order already has invoice ${existingInvoice.number}`);
      }

      const invoiceNumber = this.documentNumber("INV");
      const invoice = await tx.customerInvoice.create({
        data: {
          number: invoiceNumber,
          projectId: so.projectId,
          sourceSoId: so.id,
          status: 'DRAFT',
          totalAmount: typeof so.totalAmount === 'object' && 'toNumber' in so.totalAmount ? so.totalAmount.toNumber() : so.totalAmount,
          currency: so.currency || 'USD',
        },
      });

      // create lines from sales order lines
      const createdLines = [] as any[];
      for (const line of so.lines) {
        const created = await tx.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            description: line.description,
            quantity: typeof line.quantity === 'object' && 'toNumber' in line.quantity ? line.quantity.toNumber() : line.quantity,
            unitPrice: typeof line.unitPrice === 'object' && 'toNumber' in line.unitPrice ? line.unitPrice.toNumber() : line.unitPrice,
            amount: typeof line.amount === 'object' && 'toNumber' in line.amount ? line.amount.toNumber() : line.amount,
          },
        });
        createdLines.push(created);
      }

      // audit
      await tx.auditLog.create({ data: { action: 'INVOICE_CREATED', entityType: 'CUSTOMER_INVOICE', entityId: invoice.id, details: `Created invoice from SO ${so.number}`, createdAt: new Date() } });

      return {
        invoice,
        invoiceLines: createdLines,
      };
    });
  }

  async createInvoiceFromSo(payload: any) {
    // Expect payload: { number, projectId, sourceSoId, customerId, customerName, totalAmount, currency, invoiceLines: [{description, quantity, unitPrice, amount}] }
    return this.prisma.$transaction(async (tx) => {
      const { number, projectId, sourceSoId, customerId, customerName, totalAmount, currency, invoiceLines = [] } = payload

      if (sourceSoId) {
        const existingInvoice = await tx.customerInvoice.findFirst({
          where: { sourceSoId, status: { not: 'CANCELLED' } },
          select: { number: true },
        })
        if (existingInvoice) {
          throw new BadRequestException(`Sales Order already has invoice ${existingInvoice.number}`)
        }
      }

      const invoice = await tx.customerInvoice.create({
        data: {
          number: number || this.documentNumber("INV"),
          projectId: projectId || null,
          sourceSoId: sourceSoId || null,
          status: 'DRAFT',
          totalAmount: totalAmount || 0,
          currency: currency || 'USD',
          notes: customerName ? `Customer: ${customerName}` : undefined,
        },
      })

      const createdLines = [] as any[]
      for (const l of invoiceLines) {
        const cl = await tx.invoiceLine.create({ data: { invoiceId: invoice.id, description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, amount: l.amount } })
        createdLines.push(cl)
      }

      if (sourceSoId) {
        await tx.salesOrder.update({ where: { id: sourceSoId }, data: { status: 'POSTED' } })
      }

      await tx.auditLog.create({ data: { action: 'INVOICE_CREATED', entityType: 'CUSTOMER_INVOICE', entityId: invoice.id, details: `Created invoice ${invoice.number} from SO ${sourceSoId}`, createdAt: new Date() } })

      return { invoice, invoiceLines: createdLines }
    })
  }

  async getInvoices(projectId?: string) {
    return this.prisma.customerInvoice.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true, invoiceLines: true },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.customerInvoice.findUnique({
      where: { id },
      include: { project: true, invoiceLines: true },
    });
    if (!invoice) throw new BadRequestException('Invoice not found');
    return invoice;
  }

  /**
   * Link a Sales Order to a Project (Scenario 8.1)
   */
  async linkSalesOrderToProject(soId: string, projectId: string) {
    const so = await this.prisma.salesOrder.findUnique({ where: { id: soId } });
    if (!so) throw new BadRequestException('Sales Order not found');

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new BadRequestException('Project not found');

    return this.prisma.salesOrder.update({
      where: { id: soId },
      data: { projectId },
    });
  }

  /**
   * Link a Purchase Order to a Project (Scenario 8.2)
   */
  async linkPurchaseOrderToProject(poId: string, projectId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id: poId } });
    if (!po) throw new BadRequestException('Purchase Order not found');

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new BadRequestException('Project not found');

    return this.prisma.purchaseOrder.update({
      where: { id: poId },
      data: { projectId },
    });
  }

  /**
   * Create invoice from expenses (billable expenses)
   */
  async createInvoiceFromExpenses(projectId: string, expenseIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const expenses = await tx.expense.findMany({
        where: {
          id: { in: expenseIds },
          projectId,
          billable: true,
          status: 'APPROVED',
        },
        include: { user: true },
      });

      if (expenses.length !== expenseIds.length) {
        throw new BadRequestException('Some expenses were not found, not approved, or not billable');
      }

      const alreadyInvoiced = await tx.invoiceLine.findMany({
        where: { expenseId: { in: expenseIds } },
        select: { expenseId: true },
      });
      if (alreadyInvoiced.length > 0) {
        throw new BadRequestException('Some expenses are already linked to an invoice');
      }

      const totalAmount = expenses.reduce(
        (sum, exp) =>
          sum +
          (typeof exp.amount === 'object' && 'toNumber' in exp.amount
            ? exp.amount.toNumber()
            : exp.amount || 0),
        0,
      );

      const invoiceNumber = this.documentNumber("INV");

      // Create invoice
      const invoice = await tx.customerInvoice.create({
        data: {
          number: invoiceNumber,
          projectId,
          status: 'DRAFT',
          totalAmount,
          currency: 'USD',
        },
      });

      // Create invoice lines from expenses
      for (const expense of expenses) {
        await tx.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            expenseId: expense.id,
            description: `Expense: ${expense.category} - ${expense.notes || 'Reimbursable expense'}`,
            quantity: 1,
            unitPrice:
              typeof expense.amount === 'object' && 'toNumber' in expense.amount
                ? expense.amount.toNumber()
                : expense.amount ?? 0,
            amount:
              typeof expense.amount === 'object' && 'toNumber' in expense.amount
                ? expense.amount.toNumber()
                : expense.amount ?? 0,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'INVOICE_CREATED',
          entityType: 'CUSTOMER_INVOICE',
          entityId: invoice.id,
          details: `Created invoice from ${expenseIds.length} expenses`,
        },
      });

      return { invoice };
    });
  }
}

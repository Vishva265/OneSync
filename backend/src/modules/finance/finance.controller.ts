import { Controller, Get, Post, Body, UseGuards, Param } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger"
import { JwtAuthGuard } from "@/common/guards/jwt.guard"
import { RbacGuard } from "@/common/guards/rbac.guard"
import { Roles } from "@/common/decorators/roles.decorator"
import  { FinanceService } from "./finance.service"

@ApiTags("Finance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/finance")
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get("sales-orders")
  async getSalesOrders(query: any) {
    return this.financeService.getSalesOrders(query)
  }

  @Post('sales-orders')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async createSalesOrder(@Body() body: any) {
    return this.financeService.createSalesOrder(body);
  }

  @Post('sales-orders/:id/create-invoice')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async createInvoiceFromSalesOrder(@Param('id') id: string) {
    return this.financeService.createInvoiceFromSalesOrder(id)
  }

  @Get('sales-orders/:id')
  async getSalesOrder(@Param('id') id: string) {
    return this.financeService.getSalesOrderById(id)
  }

  // Purchase Orders
  @Get('purchase-orders')
  async getPurchaseOrders(query: any) {
    return this.financeService.getPurchaseOrders(query)
  }

  @Get('purchase-orders/:id')
  async getPurchaseOrder(@Param('id') id: string) {
    return this.financeService.getPurchaseOrderById(id)
  }

  @Post('purchase-orders')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async createPurchaseOrder(@Body() body: any) {
    return this.financeService.createPurchaseOrder(body)
  }

  // Vendor Bills
  @Get('vendor-bills')
  async getVendorBills(query: any) {
    return this.financeService.getVendorBills(query)
  }

  @Get('vendor-bills/:id')
  async getVendorBill(@Param('id') id: string) {
    return this.financeService.getVendorBillById(id)
  }

  @Post('vendor-bills/from-po/:poId')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async createVendorBillFromPo(@Param('poId') poId: string, @Body() body: any) {
    return this.financeService.createVendorBillFromPo(poId, body)
  }

  @Get("invoices")
  async getInvoices(projectId?: string) {
    return this.financeService.getInvoices(projectId)
  }

  @Post('invoices/from-timesheets')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string' },
        timesheet_ids: { type: 'array', items: { type: 'string' } },
      },
      required: ['project_id', 'timesheet_ids'],
    },
  })
  async createInvoiceFromTimesheets(
    @Body() body: { project_id: string; timesheet_ids: string[] },
  ) {
    return this.financeService.createInvoiceFromTimesheets(body.project_id, body.timesheet_ids);
  }

  @Post('invoices/from-so')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async createInvoiceFromSo(@Body() body: any) {
    return this.financeService.createInvoiceFromSo(body)
  }

  // Link Sales Order to Project (Scenario 8.1)
  @Post('sales-orders/:soId/link-project/:projectId')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async linkSalesOrderToProject(
    @Param('soId') soId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.financeService.linkSalesOrderToProject(soId, projectId);
  }

  // Link Purchase Order to Project (Scenario 8.2)
  @Post('purchase-orders/:poId/link-project/:projectId')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  async linkPurchaseOrderToProject(
    @Param('poId') poId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.financeService.linkPurchaseOrderToProject(poId, projectId);
  }

  // Create invoice from expenses (Scenario 8.3)
  @Post('invoices/from-expenses')
  @UseGuards(RbacGuard)
  @Roles('ADMIN', 'FINANCE', 'PROJECT_MANAGER')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string' },
        expense_ids: { type: 'array', items: { type: 'string' } },
      },
      required: ['project_id', 'expense_ids'],
    },
  })
  async createInvoiceFromExpenses(
    @Body() body: { project_id: string; expense_ids: string[] },
  ) {
    return this.financeService.createInvoiceFromExpenses(body.project_id, body.expense_ids);
  }
}

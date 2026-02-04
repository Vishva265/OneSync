"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const rbac_guard_1 = require("../../common/guards/rbac.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const finance_service_1 = require("./finance.service");
let FinanceController = class FinanceController {
    constructor(financeService) {
        this.financeService = financeService;
    }
    async getSalesOrders(query) {
        return this.financeService.getSalesOrders(query);
    }
    async createSalesOrder(body) {
        return this.financeService.createSalesOrder(body);
    }
    async createInvoiceFromSalesOrder(id) {
        return this.financeService.createInvoiceFromSalesOrder(id);
    }
    async getSalesOrder(id) {
        return this.financeService.getSalesOrderById(id);
    }
    // Purchase Orders
    async getPurchaseOrders(query) {
        return this.financeService.getPurchaseOrders(query);
    }
    async getPurchaseOrder(id) {
        return this.financeService.getPurchaseOrderById(id);
    }
    async createPurchaseOrder(body) {
        return this.financeService.createPurchaseOrder(body);
    }
    // Vendor Bills
    async getVendorBills(query) {
        return this.financeService.getVendorBills(query);
    }
    async getVendorBill(id) {
        return this.financeService.getVendorBillById(id);
    }
    async createVendorBillFromPo(poId, body) {
        return this.financeService.createVendorBillFromPo(poId, body);
    }
    async getInvoices(projectId) {
        return this.financeService.getInvoices(projectId);
    }
    async createInvoiceFromTimesheets(body) {
        return this.financeService.createInvoiceFromTimesheets(body.project_id, body.timesheet_ids);
    }
    async createInvoiceFromSo(body) {
        return this.financeService.createInvoiceFromSo(body);
    }
    // Link Sales Order to Project (Scenario 8.1)
    async linkSalesOrderToProject(soId, projectId) {
        return this.financeService.linkSalesOrderToProject(soId, projectId);
    }
    // Link Purchase Order to Project (Scenario 8.2)
    async linkPurchaseOrderToProject(poId, projectId) {
        return this.financeService.linkPurchaseOrderToProject(poId, projectId);
    }
    // Create invoice from expenses (Scenario 8.3)
    async createInvoiceFromExpenses(body) {
        return this.financeService.createInvoiceFromExpenses(body.project_id, body.expense_ids);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)("sales-orders"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getSalesOrders", null);
__decorate([
    (0, common_1.Post)('sales-orders'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createSalesOrder", null);
__decorate([
    (0, common_1.Post)('sales-orders/:id/create-invoice'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createInvoiceFromSalesOrder", null);
__decorate([
    (0, common_1.Get)('sales-orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getSalesOrder", null);
__decorate([
    (0, common_1.Get)('purchase-orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getPurchaseOrders", null);
__decorate([
    (0, common_1.Get)('purchase-orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getPurchaseOrder", null);
__decorate([
    (0, common_1.Post)('purchase-orders'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Get)('vendor-bills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getVendorBills", null);
__decorate([
    (0, common_1.Get)('vendor-bills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getVendorBill", null);
__decorate([
    (0, common_1.Post)('vendor-bills/from-po/:poId'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Param)('poId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createVendorBillFromPo", null);
__decorate([
    (0, common_1.Get)("invoices"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)('invoices/from-timesheets'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                project_id: { type: 'string' },
                timesheet_ids: { type: 'array', items: { type: 'string' } },
            },
            required: ['project_id', 'timesheet_ids'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createInvoiceFromTimesheets", null);
__decorate([
    (0, common_1.Post)('invoices/from-so'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createInvoiceFromSo", null);
__decorate([
    (0, common_1.Post)('sales-orders/:soId/link-project/:projectId'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Param)('soId')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "linkSalesOrderToProject", null);
__decorate([
    (0, common_1.Post)('purchase-orders/:poId/link-project/:projectId'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    __param(0, (0, common_1.Param)('poId')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "linkPurchaseOrderToProject", null);
__decorate([
    (0, common_1.Post)('invoices/from-expenses'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'FINANCE', 'PROJECT_MANAGER'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                project_id: { type: 'string' },
                expense_ids: { type: 'array', items: { type: 'string' } },
            },
            required: ['project_id', 'expense_ids'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createInvoiceFromExpenses", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)("Finance"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("api/v1/finance"),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map
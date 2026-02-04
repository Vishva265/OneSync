import { PrismaService } from "@/prisma/prisma.service";
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    createInvoiceFromTimesheets(projectId: string, timesheetIds: string[]): Promise<{
        invoice: {
            id: string;
            number: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            totalAmount: number;
            createdAt: Date;
        };
        invoiceLines: {
            id: string;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: number;
            amount: number;
        }[];
        timesheetsInvoiced: number;
    }>;
    getSalesOrders(filters?: any): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            soId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        customerName: string | null;
    })[]>;
    createSalesOrder(data: any): Promise<({
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            soId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        customerName: string | null;
    }) | null>;
    getSalesOrderById(id: string): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            soId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        customerName: string | null;
    }) | null>;
    getPurchaseOrders(filters?: any): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            poId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        vendorId: string | null;
        vendorName: string | null;
    })[]>;
    getPurchaseOrderById(id: string): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            poId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        vendorId: string | null;
        vendorName: string | null;
    }) | null>;
    createPurchaseOrder(data: any): Promise<({
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            poId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        vendorId: string | null;
        vendorName: string | null;
    }) | null>;
    getVendorBills(filters?: any): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        billLines: {
            id: string;
            createdAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            billId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        dueDate: Date | null;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        sourcePo: string | null;
        vendorId: string | null;
        vendorName: string | null;
    })[]>;
    getVendorBillById(id: string): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        billLines: {
            id: string;
            createdAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            billId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        dueDate: Date | null;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        sourcePo: string | null;
        vendorId: string | null;
        vendorName: string | null;
    }) | null>;
    createVendorBillFromPo(poId: string, body: any): Promise<{
        vendorBill: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            dueDate: Date | null;
            projectId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            sourcePo: string | null;
            vendorId: string | null;
            vendorName: string | null;
        };
        billLines: any[];
    }>;
    createInvoiceFromSalesOrder(soId: string): Promise<{
        invoice: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            dueDate: Date | null;
            projectId: string | null;
            sourceSoId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
        };
        invoiceLines: any[];
    }>;
    createInvoiceFromSo(payload: any): Promise<{
        invoice: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            dueDate: Date | null;
            projectId: string | null;
            sourceSoId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
        };
        invoiceLines: any[];
    }>;
    getInvoices(projectId?: string): Promise<({
        project: {
            id: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
            budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            startDate: Date;
            customerId: string | null;
            projectManagerId: string;
            endDate: Date | null;
            billableFlag: boolean;
            projectType: import(".prisma/client").$Enums.ProjectType;
        } | null;
        invoiceLines: {
            id: string;
            createdAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            timesheetId: string | null;
            expenseId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        dueDate: Date | null;
        projectId: string | null;
        sourceSoId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    })[]>;
    /**
     * Link a Sales Order to a Project (Scenario 8.1)
     */
    linkSalesOrderToProject(soId: string, projectId: string): Promise<{
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        customerName: string | null;
    }>;
    /**
     * Link a Purchase Order to a Project (Scenario 8.2)
     */
    linkPurchaseOrderToProject(poId: string, projectId: string): Promise<{
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        vendorId: string | null;
        vendorName: string | null;
    }>;
    /**
     * Create invoice from expenses (billable expenses)
     */
    createInvoiceFromExpenses(projectId: string, expenseIds: string[]): Promise<{
        invoice: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            dueDate: Date | null;
            projectId: string | null;
            sourceSoId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
        };
    }>;
}
//# sourceMappingURL=finance.service.d.ts.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesheetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TimesheetsService = class TimesheetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.timesheet.create({
            data: {
                ...data,
                status: "DRAFT",
                invoiced: false,
            },
        });
    }
    async findAll(filters) {
        return this.prisma.timesheet.findMany({
            where: filters,
            include: { user: true, project: true, task: true },
        });
    }
    async findById(id) {
        return this.prisma.timesheet.findUnique({
            where: { id },
            include: { user: true, project: true, task: true },
        });
    }
    async approve(id) {
        return this.prisma.timesheet.update({
            where: { id },
            data: { status: "APPROVED" },
        });
    }
    async reject(id) {
        return this.prisma.timesheet.update({
            where: { id },
            data: { status: "REJECTED" },
        });
    }
    async markInvoiced(id, invoiceId) {
        return this.prisma.timesheet.update({
            where: { id },
            data: { invoiced: true, invoiceId },
        });
    }
};
exports.TimesheetsService = TimesheetsService;
exports.TimesheetsService = TimesheetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimesheetsService);
//# sourceMappingURL=timesheets.service.js.map
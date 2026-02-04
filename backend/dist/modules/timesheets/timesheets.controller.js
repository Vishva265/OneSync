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
exports.TimesheetsController = void 0;
// src/modules/timesheets/timesheets.controller.ts
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const timesheets_service_1 = require("./timesheets.service");
let TimesheetsController = class TimesheetsController {
    constructor(timesheetsService) {
        this.timesheetsService = timesheetsService;
    }
    async findAll(req, query) {
        const filters = {};
        if (query.user)
            filters.userId = query.user;
        if (query.project)
            filters.projectId = query.project;
        if (query.status)
            filters.status = query.status;
        // Optional: default TEAM_MEMBER to their own timesheets if no user filter supplied
        if (!filters.userId && req?.user?.role === "TEAM_MEMBER") {
            filters.userId = req.user.id;
        }
        return this.timesheetsService.findAll(filters);
    }
    async findById(id) {
        return this.timesheetsService.findById(id);
    }
    async create(body) {
        return this.timesheetsService.create(body);
    }
    async update(id, body) {
        // TODO: implement real update
        return this.timesheetsService.findById(id);
    }
    async approve(id) {
        return this.timesheetsService.approve(id);
    }
    async reject(id) {
        return this.timesheetsService.reject(id);
    }
};
exports.TimesheetsController = TimesheetsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(":id/approve"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(":id/reject"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "reject", null);
exports.TimesheetsController = TimesheetsController = __decorate([
    (0, swagger_1.ApiTags)("Timesheets"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("api/v1/timesheets"),
    __metadata("design:paramtypes", [timesheets_service_1.TimesheetsService])
], TimesheetsController);
//# sourceMappingURL=timesheets.controller.js.map
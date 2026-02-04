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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const projects_service_1 = require("./projects.service");
const milestones_service_1 = require("./milestones.service");
let ProjectsController = class ProjectsController {
    constructor(projectsService, milestonesService) {
        this.projectsService = projectsService;
        this.milestonesService = milestonesService;
    }
    async findAll() {
        return this.projectsService.findAll();
    }
    async findById(id) {
        return this.projectsService.findById(id);
    }
    async getFinancials(id) {
        return this.projectsService.getFinancials(id);
    }
    async getOverview(id) {
        return this.projectsService.getProjectOverview(id);
    }
    async create(body) {
        return this.projectsService.create(body);
    }
    async update(id, body) {
        return this.projectsService.update(id, body);
    }
    // Milestone endpoints
    async getMilestones(projectId) {
        return this.milestonesService.getMilestonesByProject(projectId);
    }
    async createMilestone(projectId, body) {
        return this.milestonesService.createMilestone({ projectId, ...body });
    }
    async updateMilestone(milestoneId, body) {
        return this.milestonesService.updateMilestone(milestoneId, body);
    }
    async markMilestoneDone(milestoneId) {
        return this.milestonesService.markMilestoneDone(milestoneId);
    }
    async createInvoiceFromMilestone(milestoneId) {
        return this.milestonesService.createInvoiceFromMilestone(milestoneId);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/financials'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getFinancials", null);
__decorate([
    (0, common_1.Get)(':id/overview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/milestones'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getMilestones", null);
__decorate([
    (0, common_1.Post)(':id/milestones'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createMilestone", null);
__decorate([
    (0, common_1.Put)('milestones/:milestoneId'),
    __param(0, (0, common_1.Param)('milestoneId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateMilestone", null);
__decorate([
    (0, common_1.Post)('milestones/:milestoneId/mark-done'),
    __param(0, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "markMilestoneDone", null);
__decorate([
    (0, common_1.Post)('milestones/:milestoneId/create-invoice'),
    __param(0, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createInvoiceFromMilestone", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)("Projects"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("api/v1/projects"),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        milestones_service_1.MilestonesService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map
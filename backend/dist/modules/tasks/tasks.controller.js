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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const tasks_service_1 = require("./tasks.service");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const create_task_dto_1 = require("./dto/create-task.dto");
// DTO for moving task
class MoveTaskDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.$Enums.TaskState),
    __metadata("design:type", String)
], MoveTaskDto.prototype, "state", void 0);
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async findByProject(projectId) {
        return this.tasksService.findByProject(projectId);
    }
    async getProjectTeamMembers(projectId) {
        const project = await this.tasksService.getProjectWithTeamMembers(projectId);
        return project.teamMembers.map((member) => ({
            id: member.user.id,
            fullName: member.user.fullName,
            email: member.user.email,
            role: member.role,
        }));
    }
    async findById(id) {
        return this.tasksService.findById(id);
    }
    async create(projectId, data) {
        console.log("📤 Incoming create-task:", data);
        return this.tasksService.create(projectId, data);
    }
    async update(id, body) {
        return this.tasksService.update(id, body);
    }
    async moveTask(id, body) {
        return this.tasksService.moveTask(id, body.state);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)("projects/:projectId/tasks"),
    __param(0, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Get)("projects/:projectId/team-members"),
    __param(0, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getProjectTeamMembers", null);
__decorate([
    (0, common_1.Get)("tasks/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)("projects/:projectId/tasks"),
    __param(0, (0, common_1.Param)("projectId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("tasks/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Post)("tasks/:id/move"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, MoveTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "moveTask", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)("Tasks"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("api/v1"),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map
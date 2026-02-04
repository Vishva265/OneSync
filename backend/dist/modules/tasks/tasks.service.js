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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProject(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { teamMembers: { include: { user: true } } },
        });
        if (!project)
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        return this.prisma.task.findMany({
            where: { projectId },
            include: {
                assignee: true,
                timesheets: true,
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getProjectWithTeamMembers(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { teamMembers: { include: { user: true } } },
        });
        if (!project)
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        return project;
    }
    async findById(id) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: { assignee: true, timesheets: true, comments: true, project: true },
        });
        if (!task)
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        return task;
    }
    /**
     * ✅ Create task — allows any valid user (not just project members)
     */
    async create(projectId, data) {
        console.log("📥 Creating task with data:", data);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        // ✅ Optional: Validate user exists if provided
        if (data.assigneeId && typeof data.assigneeId === "string") {
            const userExists = await this.prisma.user.findUnique({
                where: { id: data.assigneeId },
            });
            if (!userExists)
                throw new common_1.BadRequestException(`User with ID ${data.assigneeId} does not exist`);
        }
        const state = data.state ?? client_1.$Enums.TaskState.NEW;
        return this.prisma.task.create({
            data: {
                title: data.title,
                description: data.description ?? null,
                state,
                priority: data.priority ?? "MEDIUM",
                estimateHours: data.estimateHours ?? null,
                dueDate: data.dueDate ?? null,
                project: { connect: { id: projectId } },
                ...(data.assigneeId
                    ? { assignee: { connect: { id: data.assigneeId } } }
                    : {}),
            },
            include: {
                assignee: true,
                project: true,
            },
        });
    }
    /**
     * ✅ Update task — allows assigning any valid user
     */
    async update(id, data) {
        const existing = await this.prisma.task.findUnique({
            where: { id },
            select: { id: true, projectId: true },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        // ✅ Check only if user exists (no need to be a team member)
        if (data.assigneeId && typeof data.assigneeId === "string") {
            const userExists = await this.prisma.user.findUnique({
                where: { id: data.assigneeId },
            });
            if (!userExists)
                throw new common_1.BadRequestException(`User with ID ${data.assigneeId} does not exist`);
        }
        return this.prisma.task.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                state: data.state,
                priority: data.priority,
                estimateHours: data.estimateHours,
                dueDate: data.dueDate,
                ...(data.assigneeId === null
                    ? { assignee: { disconnect: true } }
                    : data.assigneeId
                        ? { assignee: { connect: { id: data.assigneeId } } }
                        : {}),
            },
            include: { assignee: true, project: true },
        });
    }
    async moveTask(id, newState) {
        return this.prisma.task.update({
            where: { id },
            data: { state: newState },
            include: { assignee: true, project: true },
        });
    }
    async getTaskStatusAnalytics() {
        const taskCounts = await this.prisma.task.groupBy({
            by: ["state"],
            _count: { id: true },
        });
        return taskCounts.map((c) => ({ name: c.state, value: c._count.id }));
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
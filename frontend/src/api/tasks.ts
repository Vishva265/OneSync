import client from "./client"
import type { Task } from "../types"

function cleanTaskPayload(data: Partial<Task>) {
  return {
    ...data,
    title: data.title?.trim(),
    description: data.description?.trim() || undefined,
    assigneeId: data.assigneeId || undefined,
    estimateHours:
      data.estimateHours === undefined ||
      data.estimateHours === null ||
      (data.estimateHours as any) === ""
        ? undefined
        : Number(data.estimateHours),
  }
}

export const tasksApi = {
  /** 🔍 Get all tasks for a specific project */
  getByProject: (projectId: string) =>
    client.get<Task[]>(`/api/v1/projects/${projectId}/tasks`),

  /** 🔍 Get a single task by ID */
  getById: (id: string) =>
    client.get<Task>(`/api/v1/tasks/${id}`),

  /** ➕ Create a new task under a project */
  create: (projectId: string, data: Partial<Task>) =>
    client.post<Task>(`/api/v1/projects/${projectId}/tasks`, {
      ...cleanTaskPayload(data),
      state: data.state ?? "NEW", // ✅ ensure default
    }),

  /** ✏️ Update an existing task */
  update: (id: string, data: Partial<Task>) =>
    client.put<Task>(`/api/v1/tasks/${id}`, cleanTaskPayload(data)),

  /** 🔄 Move a task to a new state */
  move: (id: string, state: Task["state"]) =>
    client.post<Task>(`/api/v1/tasks/${id}/move`, { state }),

  /** 📊 Get task analytics (group by state) */
  getAnalytics: () =>
    client.get<{ name: string; value: number }[]>(`/api/v1/analytics/task-status`),
}

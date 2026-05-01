import client from "./client"
import type { Timesheet } from "@/types"

function cleanTimesheetPayload(data: Partial<Timesheet>) {
  return {
    ...data,
    projectId: data.projectId || undefined,
    taskId: data.taskId || undefined,
    workDate: data.workDate || undefined,
    durationHours:
      data.durationHours === undefined ||
      data.durationHours === null ||
      (data.durationHours as any) === ""
        ? undefined
        : Number(data.durationHours),
    notes: data.notes?.trim() || undefined,
    billable: data.billable === undefined ? undefined : Boolean(data.billable),
  }
}

export const timesheetsApi = {
  getAll: (filters?: Record<string, string>) => client.get<Timesheet[]>("/api/v1/timesheets", { params: filters }),
  getById: (id: string) => client.get<Timesheet>(`/api/v1/timesheets/${id}`),
  create: (data: Partial<Timesheet>) => client.post<Timesheet>("/api/v1/timesheets", cleanTimesheetPayload(data)),
  update: (id: string, data: Partial<Timesheet>) => client.put<Timesheet>(`/api/v1/timesheets/${id}`, cleanTimesheetPayload(data)),
  approve: (id: string) => client.put(`/api/v1/timesheets/${id}/approve`),
  reject: (id: string) => client.put(`/api/v1/timesheets/${id}/reject`),
}

import client from "./client"
import type { Timesheet } from "@/types"

export const timesheetsApi = {
  getAll: (filters?: Record<string, string>) => client.get<Timesheet[]>("/api/v1/timesheets", { params: filters }),
  getById: (id: string) => client.get<Timesheet>(`/api/v1/timesheets/${id}`),
  create: (data: Partial<Timesheet>) => client.post<Timesheet>("/api/v1/timesheets", data),
  update: (id: string, data: Partial<Timesheet>) => client.put<Timesheet>(`/api/v1/timesheets/${id}`, data),
  approve: (id: string) => client.put(`/api/v1/timesheets/${id}/approve`),
  reject: (id: string) => client.put(`/api/v1/timesheets/${id}/reject`),
}

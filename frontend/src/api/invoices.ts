import client from "./client"
import type { CustomerInvoice } from "@/types"

export const invoicesApi = {
  getAll: (projectId?: string) =>
    client.get<CustomerInvoice[]>("/api/v1/finance/invoices", {
      params: projectId ? { project: projectId } : {},
    }),
  getById: (id: string) => client.get<CustomerInvoice>(`/api/v1/finance/invoices/${id}`),
  createFromTimesheets: (projectId: string, timesheetIds: string[]) =>
    client.post("/api/v1/finance/invoices/from-timesheets", {
      project_id: projectId,
      timesheet_ids: timesheetIds,
    }),
  createFromSo: (payload: any) => client.post('/api/v1/finance/invoices/from-so', payload),
}

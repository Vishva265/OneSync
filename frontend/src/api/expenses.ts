import client from "./client"
import type { Expense } from "@/types"

export const expensesApi = {
  getAll: (filters?: { projectId?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.projectId) params.append("project", filters.projectId)
    if (filters?.status) params.append("status", filters.status)
    return client.get<Expense[]>(`/api/v1/expenses?${params}`)
  },
  getPending: (projectId?: string) => {
    const url = projectId 
      ? `/api/v1/expenses/pending?projectId=${projectId}`
      : "/api/v1/expenses/pending"
    return client.get<Expense[]>(url)
  },
  getByProject: (projectId: string) => 
    client.get<Expense[]>(`/api/v1/expenses/project/${projectId}`),
  getById: (id: string) => client.get<Expense>(`/api/v1/expenses/${id}`),
  create: (data: Partial<Expense>) => client.post<Expense>("/api/v1/expenses", data),
  update: (id: string, data: Partial<Expense>) => client.put<Expense>(`/api/v1/expenses/${id}`, data),
  approve: (id: string) => client.put<Expense>(`/api/v1/expenses/${id}/approve`, {}),
  reject: (id: string, reason?: string) => 
    client.put<Expense>(`/api/v1/expenses/${id}/reject`, { reason }),
  reimburse: (id: string) => client.put<Expense>(`/api/v1/expenses/${id}/reimburse`, {}),
}

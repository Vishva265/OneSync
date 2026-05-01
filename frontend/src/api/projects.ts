import client from "./client"
import type { Project, ProjectFinancials, ProjectOverview, Milestone } from "@/types"

export const projectsApi = {
  getAll: () => client.get<Project[]>("/api/v1/projects"),
  getById: (id: string) => client.get<Project>(`/api/v1/projects/${id}`),
  create: (data: Partial<Project>) => client.post<Project>("/api/v1/projects", data),
  update: (id: string, data: Partial<Project>) => client.put<Project>(`/api/v1/projects/${id}`, data),
  addTeamMember: (id: string, data: { userId: string; role?: string }) =>
    client.post(`/api/v1/projects/${id}/team-members`, data),
  removeTeamMember: (id: string, userId: string) =>
    client.delete(`/api/v1/projects/${id}/team-members/${userId}`),
  getFinancials: (id: string) => client.get<ProjectFinancials>(`/api/v1/projects/${id}/financials`),
  getOverview: (id: string) => client.get<ProjectOverview>(`/api/v1/projects/${id}/overview`),
}

export const milestonesApi = {
  getByProject: (projectId: string) => client.get<Milestone[]>(`/api/v1/projects/${projectId}/milestones`),
  create: (projectId: string, data: Partial<Milestone>) => 
    client.post<Milestone>(`/api/v1/projects/${projectId}/milestones`, data),
  update: (milestoneId: string, data: Partial<Milestone>) => 
    client.put<Milestone>(`/api/v1/projects/milestones/${milestoneId}`, data),
  markDone: (milestoneId: string) => 
    client.post<Milestone>(`/api/v1/projects/milestones/${milestoneId}/mark-done`, {}),
  createInvoice: (milestoneId: string) => 
    client.post(`/api/v1/projects/milestones/${milestoneId}/create-invoice`, {}),
}



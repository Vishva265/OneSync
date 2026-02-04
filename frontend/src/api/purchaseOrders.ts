import client from "./client"

export const purchaseOrdersApi = {
  getAll: (projectId?: string) => client.get(`/api/v1/finance/purchase-orders${projectId ? `?projectId=${projectId}` : ''}`),
  getById: (id: string) => client.get(`/api/v1/finance/purchase-orders/${id}`),
  create: (payload: any) => client.post(`/api/v1/finance/purchase-orders`, payload),
}

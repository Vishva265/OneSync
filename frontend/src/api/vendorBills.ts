import client from "./client"

export const vendorBillsApi = {
  getAll: (projectId?: string) => client.get(`/api/v1/finance/vendor-bills${projectId ? `?projectId=${projectId}` : ''}`),
  getById: (id: string) => client.get(`/api/v1/finance/vendor-bills/${id}`),
  createFromPo: (poId: string, payload: any) => client.post(`/api/v1/finance/vendor-bills/from-po/${poId}`, payload),
}

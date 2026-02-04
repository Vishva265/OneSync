import client from './client'

export const salesOrdersApi = {
  getAll: (projectId?: string) =>
    client.get('/api/v1/finance/sales-orders', { params: projectId ? { project: projectId } : {} }),
  create: (data: any) => client.post('/api/v1/finance/sales-orders', data),
  createInvoice: (soId: string) => client.post(`/api/v1/finance/sales-orders/${soId}/create-invoice`),
  getById: (id: string) => client.get(`/api/v1/finance/sales-orders/${id}`),
}

export default salesOrdersApi

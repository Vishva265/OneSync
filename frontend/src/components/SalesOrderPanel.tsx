"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { salesOrdersApi } from "@/api/salesOrders"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "./ui/card"
import { FileText, PlusCircle } from "lucide-react"

export function SalesOrderPanel({ projectId }: { projectId?: string }) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  // Fetch: ask backend to filter by project via ?project=<id>
  const { data: salesOrders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["sales-orders", projectId],
    queryFn: () => salesOrdersApi.getAll(projectId).then((r) => r.data),
  })

  // Extra safety: if backend doesn’t filter yet, filter here too.
  const projectSalesOrders = useMemo(
    () => (projectId ? salesOrders.filter((so: any) => so.projectId === projectId) : salesOrders),
    [salesOrders, projectId],
  )

  const createMutation = useMutation({
    mutationFn: (payload: any) => salesOrdersApi.create(payload).then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-orders", projectId] })
      setCustomerName("")
      setNotes("")
      setLines([{ productName: "", quantity: 1, unitPrice: 0 }])
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (soId: string) => salesOrdersApi.createInvoice(soId).then((r: any) => r.data),
    onSuccess: (data: any) => {
      const invoiceId = data?.invoice?.id
      if (invoiceId) navigate(`/invoice/view/${invoiceId}`)
    },
  })

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<Array<any>>([{ productName: "", quantity: 1, unitPrice: 0 }])

  const addLine = () => setLines((prev) => [...prev, { productName: "", quantity: 1, unitPrice: 0 }])
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx))
  const updateLine = (idx: number, key: string, value: any) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l)))

  const total = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unitPrice || 0), 0)
  const fmtMoney = (n: number) =>
    (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })

  const submit = () => {
    if (!customerName) return alert("Customer name is required")
    if (!projectId) return alert("This Sales Order must be associated to a project")
    const payload = {
      customerName,
      notes,
      date: new Date().toISOString(),
      lines,
      projectId, // ✅ ensure it’s tied to THIS project
    }
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Sales Orders</h3>
        <Button
          type="button"
          variant="outline"
          className="border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg"
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Create Sales Order</h4>
          <Card className="rounded-xl border border-gray-100 shadow-sm">
            <CardContent className="space-y-4 pt-4">
              {!projectId && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                  This panel needs a projectId to create & list project sales orders.
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  value={customerName}
                  onChange={(e: any) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Acme Corp."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional notes"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Line Items</label>
                <div className="space-y-2">
                  {lines.map((l, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_90px_140px_auto] gap-2">
                      <input
                        placeholder="Product name"
                        value={l.productName}
                        onChange={(e: any) => updateLine(idx, "productName", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={l.quantity}
                        onChange={(e: any) => updateLine(idx, "quantity", Number(e.target.value))}
                        placeholder="Qty"
                        min={0}
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={l.unitPrice}
                        onChange={(e: any) => updateLine(idx, "unitPrice", Number(e.target.value))}
                        placeholder="Unit Price"
                        min={0}
                      />
                      <div className="flex items-center">
                        <Button
                          type="button"
                          onClick={() => removeLine(idx)}
                          variant="outline"
                          className="border-gray-300 hover:border-red-500 hover:text-red-600 rounded-lg"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Button type="button" onClick={addLine} variant="outline" className="gap-2 rounded-lg border-gray-300 hover:border-blue-600 hover:text-blue-600">
                    <PlusCircle className="w-4 h-4" />
                    Add Line
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-900">Total:</div>
                <div className="text-lg font-bold text-blue-700">{fmtMoney(total)}</div>
              </div>

              <Button
                onClick={submit}
                disabled={createMutation.isPending || !projectId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {createMutation.isPending ? "Creating..." : "Create SO"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Existing Sales Orders</h4>

          {isLoading && (
            <Card className="rounded-xl border border-gray-200 bg-white">
              <CardContent className="p-4 text-sm text-gray-600">Loading…</CardContent>
            </Card>
          )}

          {isError && (
            <Card className="rounded-xl border border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">
                Couldn’t load sales orders. Please try again.
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && projectSalesOrders.length === 0 ? (
            <Card className="rounded-xl border border-dashed border-gray-300 bg-white">
              <CardContent className="p-6 flex items-center gap-3 text-gray-600">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {projectId ? "No sales orders for this project yet." : "No sales orders."}
                  </p>
                  <p className="text-sm text-gray-500">Create a sales order using the form on the left.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {projectSalesOrders.map((so: any) => (
                <Card key={so.id} className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{so.number}</div>
                        <div className="text-sm text-gray-600 truncate">{so.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {fmtMoney(Number(so.totalAmount ?? 0))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {so.createdAt ? new Date(so.createdAt).toLocaleDateString?.() : ""}
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                          <Button
                            onClick={() => createInvoiceMutation.mutate(so.id)}
                            disabled={createInvoiceMutation.isPending}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                          </Button>
                          <Button
                            onClick={() => navigate(`/invoice/${so.id}`)}
                            className="text-sm"
                            variant="outline"
                          >
                            Edit & Create Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

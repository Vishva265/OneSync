"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { purchaseOrdersApi } from "@/api/purchaseOrders"
import { vendorBillsApi } from "@/api/vendorBills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { FileText, PlusCircle } from "lucide-react"

export function PurchaseOrdersPanel({ projectId }: { projectId?: string }) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  // 🔎 Fetch POs for this project (server filters by ?projectId=)
  const { data: posResp, isLoading, isError, refetch } = useQuery({
    queryKey: ["finance:purchase-orders", projectId],
    queryFn: () => purchaseOrdersApi.getAll(projectId).then((r) => r.data),
  })
  const pos = Array.isArray(posResp) ? posResp : []

  // (Extra guard in case server doesn’t filter)
  const projectPOs = useMemo(
    () => (projectId ? pos.filter((po: any) => po.projectId === projectId) : pos),
    [pos, projectId]
  )

  // 🧾 Create PO (attached to this project)
  const createPoMutation = useMutation({
    mutationFn: (payload: any) => purchaseOrdersApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance:purchase-orders", projectId] })
      setDraft({ vendorName: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] })
    },
  })

  // 📄 Create Vendor Bill from PO
  const createBillMutation = useMutation({
    mutationFn: (poId: string) => vendorBillsApi.createFromPo(poId, {}).then((r) => r.data),
    onSuccess: (bill) => {
      qc.invalidateQueries({ queryKey: ["finance:vendor-bills", projectId] })
      if (bill?.id) navigate(`/vendor-bill/view/${bill.id}`)
    },
  })

  // 🧱 Draft form state
  const [draft, setDraft] = useState<{
    vendorName: string
    lines: Array<{ description: string; quantity: number; unitPrice: number }>
  }>({ vendorName: "", lines: [{ description: "", quantity: 1, unitPrice: 0 }] })

  const addLine = () =>
    setDraft((d) => ({
      ...d,
      lines: [...d.lines, { description: "", quantity: 1, unitPrice: 0 }],
    }))

  const updateLine = (
    idx: number,
    key: "description" | "quantity" | "unitPrice",
    value: string | number
  ) =>
    setDraft((d) => {
      const lines = d.lines.slice()
      lines[idx] = { ...lines[idx], [key]: key === "description" ? String(value) : Number(value) }
      return { ...d, lines }
    })

  const totalDraft = draft.lines.reduce(
    (s, l) => s + Number(l.quantity || 0) * Number(l.unitPrice || 0),
    0
  )

  const fmtMoney = (n: number) =>
    (Number(n) || 0).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    })

  const createPO = () => {
    if (!projectId) return alert("This Purchase Order must be associated with a project.")
    if (!draft.vendorName.trim()) return alert("Vendor name is required.")

    const payload = {
      vendorName: draft.vendorName.trim(),
      projectId, // ✅ backend expects projectId
      lines: draft.lines.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity || 0),
        unitPrice: Number(l.unitPrice || 0),
      })),
    }
    createPoMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Purchase Orders</h3>
        <Button
          type="button"
          variant="outline"
          className="border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg gap-2"
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      {/* Existing POs (filtered by project) */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Existing Purchase Orders</h4>

        {isLoading && (
          <Card className="rounded-xl border border-gray-200 bg-white">
            <CardContent className="p-4 text-sm text-gray-600">Loading POs…</CardContent>
          </Card>
        )}

        {isError && (
          <Card className="rounded-xl border border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">
              Couldn’t load purchase orders. Please try again.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && projectPOs.length === 0 ? (
          <Card className="rounded-xl border border-dashed border-gray-300 bg-white">
            <CardContent className="p-6 flex items-center gap-3 text-gray-600">
              <FileText className="w-5 h-5" />
              <div>
                <p className="font-medium">
                  {projectId ? "No purchase orders for this project yet." : "No purchase orders."}
                </p>
                <p className="text-sm text-gray-500">Create a PO using the form below.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectPOs.map((po: any) => (
              <Card
                key={po.id}
                className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-900">{po.number}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Vendor: <span className="text-gray-900">{po.vendorName}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total:{" "}
                    <span className="font-medium text-gray-900">
                      {fmtMoney(Number(po.totalAmount ?? 0))}
                    </span>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button
                      onClick={() => createBillMutation.mutate(po.id)}
                      disabled={createBillMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {createBillMutation.isPending ? "Creating…" : "Create Bill"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg"
                      // FIX: navigate to an existing route from your router:
                      // You have: <Route path="/vendor-bill/:poId" element={<VendorBillFromPoPage />} />
                      onClick={() => navigate(`/vendor-bill/${po.id}`)}
                    >
                      View PO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create PO */}
      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">
            Create Purchase Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!projectId && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              A projectId is required to create purchase orders here.
            </div>
          )}

          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Vendor name"
            value={draft.vendorName}
            onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })}
          />

          {draft.lines.map((ln, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description"
                value={ln.description}
                onChange={(e) => updateLine(idx, "description", e.target.value)}
              />
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Qty"
                type="number"
                value={ln.quantity}
                onChange={(e) => updateLine(idx, "quantity", e.target.value)}
              />
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unit Price"
                type="number"
                value={ln.unitPrice}
                onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
              />
            </div>
          ))}

          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={addLine}
              variant="outline"
              className="gap-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600"
            >
              <PlusCircle className="w-4 h-4" />
              Add line
            </Button>
            <div className="font-semibold text-gray-900">
              Draft Total: <span className="text-blue-700">{fmtMoney(totalDraft)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={createPO}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              disabled={createPoMutation.isPending || !projectId}
            >
              {createPoMutation.isPending ? "Creating…" : "Create PO"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

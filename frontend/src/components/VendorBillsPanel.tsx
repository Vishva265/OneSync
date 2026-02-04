"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { vendorBillsApi } from "@/api/vendorBills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { FileText } from "lucide-react"

export function VendorBillsPanel({ projectId }: { projectId?: string }) {
  const navigate = useNavigate()

  // 🔎 Fetch vendor bills filtered by project
  const { data: billsResp, isLoading, isError, refetch } = useQuery({
    queryKey: ["finance:vendor-bills", projectId],
    queryFn: () => vendorBillsApi.getAll(projectId).then((r) => r.data),
  })

  const bills = Array.isArray(billsResp) ? billsResp : []

  // Optional safeguard — local filter if backend doesn't yet filter by ?projectId=
  const projectBills = useMemo(
    () => (projectId ? bills.filter((b: any) => b.projectId === projectId) : bills),
    [bills, projectId]
  )

  const fmtMoney = (n: number) =>
    (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })

  const statusChip = (status?: string) => {
    if (!status) return null
    const s = String(status).toUpperCase()
    const cls =
      s === "PAID"
        ? "bg-green-100 text-green-700"
        : s === "DRAFT"
        ? "bg-gray-100 text-gray-700"
        : "bg-yellow-100 text-yellow-700" // e.g. SENT / PARTIAL / OVERDUE
    return <span className={`mt-1 text-xs px-2 py-1 rounded-lg inline-block ${cls}`}>{s}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Vendor Bills</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          className="border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg"
        >
          Refresh
        </Button>
      </div>

      {isLoading && (
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardContent className="p-4 text-sm text-gray-600">Loading vendor bills…</CardContent>
        </Card>
      )}

      {isError && (
        <Card className="rounded-xl border border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            Couldn’t load vendor bills. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && projectBills.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-gray-300 bg-white">
          <CardContent className="p-6 flex items-center gap-3 text-gray-600">
            <FileText className="w-5 h-5" />
            <div>
              <p className="font-medium">
                {projectId ? "No vendor bills found for this project." : "No vendor bills available."}
              </p>
              <p className="text-sm text-gray-500">Create a vendor bill from a purchase order to see it here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectBills.map((b: any) => (
            <Card
              key={b.id}
              className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  {b.number || "Untitled Bill"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-600">
                  Vendor: <span className="text-gray-900">{b.vendorName || "—"}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Total: <span className="font-medium text-gray-900">{fmtMoney(Number(b.totalAmount ?? 0))}</span>
                </div>
                {statusChip(b.status)}
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/vendor-bill/view/${b.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    View Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

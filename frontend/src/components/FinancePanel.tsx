"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import { invoicesApi } from "@/api/invoices"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Check, Loader2, FileText } from "lucide-react"

export function FinancePanel({ projectId }: { projectId: string }) {
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([])

  const {
    data: timesheets = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["approved-timesheets", projectId],
    queryFn: async () => {
      const res = await timesheetsApi.getAll({ project: projectId, status: "APPROVED" })
      // show only ones not yet invoiced
      return res.data.filter((ts: any) => !ts.invoiced)
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (timesheetIds: string[]) =>
      invoicesApi.createFromTimesheets(projectId, timesheetIds),
    onSuccess: () => {
      setSelectedTimesheets([])
      alert("Invoice created successfully!")
      refetch()
    },
  })

  const toggleTimesheet = (id: string) => {
    setSelectedTimesheets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const totalAmount = timesheets
    .filter((ts: any) => selectedTimesheets.includes(ts.id))
    .reduce((sum: number, ts: any) => sum + Number(ts.amount || 0), 0)

  const fmtMoney = (n: number) =>
    (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Create Invoice from Timesheets</h3>
          <p className="text-sm text-gray-600">Select approved time entries to include in a new invoice.</p>
        </div>

        {selectedTimesheets.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium">
            {selectedTimesheets.length} selected
          </span>
        )}
      </div>

      {/* Loading / Error / Empty */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading approved timesheets…</span>
        </div>
      )}

      {isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          Something went wrong while loading timesheets.
        </div>
      )}

      {!isLoading && !isError && timesheets.length === 0 && (
        <Card className="border border-dashed border-gray-300 bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-3 text-gray-600">
            <FileText className="w-5 h-5" />
            <div>
              <p className="font-medium">No approved timesheets to invoice</p>
              <p className="text-sm text-gray-500">Approve timesheets first, then return here to create an invoice.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timesheet list */}
      <div className="space-y-3">
        {timesheets.map((ts: any) => {
          const checked = selectedTimesheets.includes(ts.id)
          const workDate = new Date(ts.workDate)
          const dateLabel = isNaN(workDate.getTime())
            ? String(ts.workDate)
            : workDate.toLocaleDateString()

          return (
            <Card
              key={ts.id}
              className={[
                "rounded-xl border transition-shadow",
                checked ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-white border-gray-200 hover:shadow-sm",
              ].join(" ")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  title={`Select timesheet on ${dateLabel}`}
                  aria-label={`Select timesheet on ${dateLabel}`}
                  checked={checked}
                  onChange={() => toggleTimesheet(ts.id)}
                  className="w-4 h-4 text-blue-600 cursor-pointer accent-blue-600"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {Number(ts.durationHours) || 0}h @ {fmtMoney(Number(ts.hourlyRate) || 0)}/h
                  </p>
                  <p className="text-sm text-gray-600">{dateLabel}</p>
                </div>

                <span className="font-semibold text-gray-900">
                  {fmtMoney(Number(ts.amount) || 0)}
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer action */}
      {selectedTimesheets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total Invoice Amount</span>
            <span className="text-2xl font-bold text-blue-700">
              {fmtMoney(totalAmount)}
            </span>
          </div>

          <Button
            onClick={() => createInvoiceMutation.mutate(selectedTimesheets)}
            disabled={createInvoiceMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      )}
    </div>
  )
}

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import type { Timesheet } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TimesheetsPage() {
  const qc = useQueryClient()
  const [filters, setFilters] = useState<{ user?: string; project?: string; status?: string }>({})
  const [draft, setDraft] = useState<Partial<Timesheet>>({ billable: true, durationHours: 1, hourlyRate: 0 })

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ["timesheets", filters],
    queryFn: async () => (await timesheetsApi.getAll(filters as any)).data,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Timesheet>) => timesheetsApi.create(payload),
    onSuccess: () => {
      setDraft({ billable: true, durationHours: 1, hourlyRate: 0 })
      qc.invalidateQueries({ queryKey: ["timesheets"] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timesheets</h1>
          <p className="text-gray-600 text-sm">Log and review work hours</p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Filter by project ID"
            className="px-3 py-2 border rounded"
            value={filters.project || ""}
            onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value || undefined }))}
          />
          <select
            className="px-3 py-2 border rounded"
            value={filters.status || ""}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Log</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-6 gap-3">
          <input
            placeholder="Project ID"
            className="px-3 py-2 border rounded"
            value={draft.projectId || ""}
            onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}
          />
          <input
            placeholder="Task ID (optional)"
            className="px-3 py-2 border rounded"
            value={draft.taskId || ""}
            onChange={(e) => setDraft({ ...draft, taskId: e.target.value || undefined })}
          />
          <input
            type="date"
            className="px-3 py-2 border rounded"
            value={draft.workDate || ""}
            onChange={(e) => setDraft({ ...draft, workDate: e.target.value })}
          />
          <input
            type="number"
            min={0.25}
            step={0.25}
            className="px-3 py-2 border rounded"
            value={draft.durationHours || 0}
            onChange={(e) => setDraft({ ...draft, durationHours: Number(e.target.value) })}
          />
          <input
            type="number"
            min={0}
            className="px-3 py-2 border rounded"
            placeholder="Hourly Rate"
            value={draft.hourlyRate || 0}
            onChange={(e) => setDraft({ ...draft, hourlyRate: Number(e.target.value) })}
          />
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate({ ...draft, billable: !!draft.billable } as Partial<Timesheet>)}
          >
            {createMutation.isPending ? "Saving..." : "Log Time"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {isLoading && <div>Loading...</div>}
        {!isLoading &&
          timesheets.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {t.durationHours}h @ ${t.hourlyRate}/h {t.billable ? "• Billable" : "• Non-billable"}
                  </div>
                  <div className="text-sm text-gray-600">{new Date(t.workDate).toLocaleDateString()} • {t.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${t.amount}</div>
                  <div className="text-xs text-gray-500">{t.projectId}</div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}

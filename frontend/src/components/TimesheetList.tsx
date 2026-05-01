import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import { tasksApi } from "@/api/tasks"
import type { Timesheet } from "@/types"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

function todayInputValue() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

export function TimesheetList({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Timesheet>>({
    projectId,
    billable: true,
    durationHours: 1,
    workDate: todayInputValue(),
  })

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      projectId,
      taskId: undefined,
    }))
  }, [projectId])

  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets", projectId],
    queryFn: async () => {
      const res = await timesheetsApi.getAll({ project: projectId })
      return res.data
    },
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => (await tasksApi.getByProject(projectId)).data,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Timesheet>) => timesheetsApi.create(payload),
    onSuccess: () => {
      setFormError(null)
      setShowForm(false)
      setDraft({
        projectId,
        billable: true,
        durationHours: 1,
        workDate: todayInputValue(),
      })
      queryClient.invalidateQueries({ queryKey: ["timesheets", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project-financials", projectId] })
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || error.message || "Failed to log time")
    },
  })

  const canSubmit = Boolean(draft.workDate && Number(draft.durationHours || 0) > 0 && !createMutation.isPending)

  function submitTime() {
    setFormError(null)
    if (!draft.workDate) {
      setFormError("Choose a work date before logging time.")
      return
    }
    if (Number(draft.durationHours || 0) <= 0) {
      setFormError("Hours must be greater than zero.")
      return
    }

    createMutation.mutate({
      ...draft,
      projectId,
      durationHours: Number(draft.durationHours),
      taskId: draft.taskId || undefined,
      billable: !!draft.billable,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Timesheets</h3>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? "Cancel" : "+ Log Time"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_150px_120px_120px_auto]">
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={draft.taskId || ""}
              onChange={(event) => setDraft((current) => ({ ...current, taskId: event.target.value || undefined }))}
              disabled={tasksLoading}
            >
              <option value="">{tasksLoading ? "Loading tasks..." : "No task / general work"}</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              type="date"
              value={draft.workDate || ""}
              onChange={(event) => setDraft((current) => ({ ...current, workDate: event.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              type="number"
              min={0.25}
              step={0.25}
              placeholder="Hours"
              value={(draft.durationHours as number | string | undefined) ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  durationHours: event.target.value === "" ? ("" as any) : Number(event.target.value),
                }))
              }
            />
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!draft.billable}
                onChange={(event) => setDraft((current) => ({ ...current, billable: event.target.checked }))}
              />
              Billable
            </label>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={submitTime}
              disabled={!canSubmit}
            >
              {createMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <textarea
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Notes"
            value={draft.notes || ""}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
          />
          {formError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {timesheets.map((ts) => (
          <Card key={ts.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {ts.durationHours}h @ ${ts.hourlyRate}/h
                </p>
                <p className="text-sm text-gray-600">{new Date(ts.workDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    ts.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : ts.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ts.status}
                </span>
                <span className="text-sm font-semibold">${ts.amount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

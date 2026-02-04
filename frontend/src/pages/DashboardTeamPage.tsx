import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "../api/projects"
import { timesheetsApi } from "../api/timesheets"
import { expensesApi } from "../api/expenses"
import { tasksApi } from "../api/tasks"
import { useAuthStore } from "../store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ListChecks, Clock as ClockIcon, DollarSign, Receipt } from "lucide-react"

type TaskState = "NEW" | "IN_PROGRESS" | "BLOCKED" | "DONE"

export function DashboardTeamPage() {
  const POLL_MS = 15_000
  const queryClient = useQueryClient()
  const user = useAuthStore((s: any) => s.user)

  // --- Projects (used to attach project code/name on tasks)
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  const allProjectIds: string[] = useMemo(
    () => (projects as any[]).map((p) => String(p.id)),
    [projects]
  )

  // --- My timesheets (for KPI)
  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets", user?.id],
    queryFn: async () => (await timesheetsApi.getAll({ user: user?.id || "" })).data,
    enabled: !!user?.id,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  // --- My expenses (for KPI)
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => (await expensesApi.getAll({ user: (user?.id || "") as any })).data,
    enabled: !!user?.id,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  // --- All tasks assigned to me (robust)
  const { data: myTasks = [], isFetching: isFetchingTasks } = useQuery({
    queryKey: ["team-myTasks-allProjects", user?.id, allProjectIds],
    queryFn: async () => {
      if (!user?.id) return []

      const normalizeList = (raw: any): any[] => {
        if (Array.isArray(raw)) return raw
        if (raw && Array.isArray(raw.tasks)) return raw.tasks
        return []
      }

      // 1) Try per-project fetch (preferred for cache locality)
      let fromProjects: any[] = []
      if (allProjectIds.length > 0) {
        const perProject = await Promise.all(
          allProjectIds.map(async (pid) => {
            const res = await tasksApi.getByProject(pid)
            return normalizeList(res.data)
          })
        )
        fromProjects = perProject.flat()
      }

      // 2) Global fallback (if available)
      let fromAll: any[] = []
      if ((!fromProjects || fromProjects.length === 0) && (tasksApi as any).getAll) {
        try {
          const resAll = await (tasksApi as any).getAll({ assigneeId: user.id })
          fromAll = normalizeList(resAll.data)
        } catch {
          // ignore
        }
      }

      const combined = (fromProjects.length ? fromProjects : fromAll) || []

      // Normalize IDs & filter to me
      const mine = combined.filter((t: any) => {
        const aid = String(t.assigneeId || t.assignee?.id || "")
        return aid && aid === String(user.id)
      })

      // Attach project code/name + normalize estimate hours
      const byId = new Map((projects as any[]).map((p) => [String(p.id), p]))
      return mine.map((t: any) => {
        const p = byId.get(String(t.projectId)) || {}
        return {
          ...t,
          _projectCode: p.code || "",
          _projectName: p.name || "",
          _estimateHours: Number(t.estimateHours ?? 0),
        }
      })
    },
    enabled: !!user?.id,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  // --- KPIs
  const todayHours = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return (timesheets as any[])
      .filter((t) => (t.workDate || "").startsWith(today))
      .reduce((s, t) => s + (Number(t.durationHours) || 0), 0)
  }, [timesheets])

  const myTasksCount = (myTasks as any[]).length

  // --- Kanban (move only)
  const columns: TaskState[] = ["NEW", "IN_PROGRESS", "BLOCKED", "DONE"]

  const grouped = useMemo(() => {
    const map: Record<TaskState, any[]> = { NEW: [], IN_PROGRESS: [], BLOCKED: [], DONE: [] }
    ;(myTasks as any[]).forEach((t) => {
      const s = ((t.state as TaskState) || "NEW") as TaskState
      ;(map[s] ?? map.NEW).push(t)
    })
    return map
  }, [myTasks])

  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskState | null>(null)

  const moveMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: TaskState }) => tasksApi.move(id, state),
    onMutate: async ({ id, state }) => {
      const qk = ["team-myTasks-allProjects", user?.id, allProjectIds] as const
      await queryClient.cancelQueries({ queryKey: qk })
      const prev = queryClient.getQueryData<any[]>(qk) || []
      queryClient.setQueryData<any[]>(qk, (old = []) => old.map((t) => (t.id === id ? { ...t, state } : t)))
      return { prev, qk }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev && ctx?.qk) queryClient.setQueryData(ctx.qk, ctx.prev)
    },
    onSettled: () => {
      const qk = ["team-myTasks-allProjects", user?.id, allProjectIds] as const
      queryClient.invalidateQueries({ queryKey: qk })
      allProjectIds.forEach((pid) => queryClient.invalidateQueries({ queryKey: ["tasks", pid] }))
    },
  })

  function onDragStart(e: React.DragEvent, taskId: string) {
    setDragTaskId(taskId)
    e.dataTransfer.setData("text/plain", taskId)
  }
  function onDrop(_e: React.DragEvent, targetState: TaskState) {
    const id = dragTaskId
    setDragTaskId(null)
    setDragOverCol(null)
    if (!id) return
    moveMutation.mutate({ id, state: targetState })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Work</h1>
          <p className="text-gray-600">Welcome back{user?.fullName ? `, ${user.fullName}` : ""}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-blue-100">
                  <ListChecks className="w-4 h-4 text-blue-700" />
                </span>
                My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{myTasksCount}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-blue-100">
                  <ClockIcon className="w-4 h-4 text-blue-700" />
                </span>
                Hours Logged Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{todayHours}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-blue-100">
                  <DollarSign className="w-4 h-4 text-blue-700" />
                </span>
                Billable Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-blue-100">
                  <Receipt className="w-4 h-4 text-blue-700" />
                </span>
                Expenses Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{(expenses as any[]).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tasks Kanban */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Tasks (across projects)</h2>
            {isFetchingTasks && <p className="text-xs text-gray-400">Refreshing tasks...</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map((column) => (
              <div
                key={column}
                className={`rounded-xl p-4 min-h-[320px] bg-white border
                  ${dragOverCol === column ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                `}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOverCol(column)}
                onDragLeave={() => setDragOverCol((c) => (c === column ? null : c))}
                onDrop={(e) => onDrop(e, column)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-700 tracking-wide">
                    {column.replace("_", " ")}
                  </h3>
                  <span className="text-xs text-gray-400">{grouped[column].length}</span>
                </div>

                <div className="space-y-3">
                  {grouped[column].map((task: any) => (
                    <Card
                      key={task.id}
                      className="hover:shadow-md cursor-move rounded-lg border border-gray-200 transition-shadow"
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">
                            {task._projectCode || task._projectName || ""}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs px-2 py-1 rounded-lg font-medium
                              ${
                                task.priority === "CRITICAL"
                                  ? "bg-red-100 text-red-800"
                                  : task.priority === "HIGH"
                                  ? "bg-orange-100 text-orange-800"
                                  : task.priority === "MEDIUM"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            `}
                          >
                            {task.priority}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-600">
                              {Number(task._estimateHours) ? `${Number(task._estimateHours)}h` : "—"}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-green-100 text-green-700">
                              Assigned to me
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {grouped[column].length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions (optional, purely presentational) */}
        <div className="hidden">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Create Task</Button>
        </div>
      </div>
    </div>
  )
}

export default DashboardTeamPage

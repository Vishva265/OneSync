import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { expensesApi } from "../api/expenses"
import { projectsApi } from "../api/projects"
import { tasksApi } from "../api/tasks"
import { timesheetsApi } from "../api/timesheets"
import { useAuthStore } from "../store/auth"
import { Clock as ClockIcon, DollarSign, ListChecks, Receipt } from "lucide-react"

type TaskState = "NEW" | "IN_PROGRESS" | "BLOCKED" | "DONE"

const columns: TaskState[] = ["NEW", "IN_PROGRESS", "BLOCKED", "DONE"]

const columnLabels: Record<TaskState, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  DONE: "Done",
}

function KpiCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: string | number
  note?: string
  icon: typeof ListChecks
}) {
  return (
    <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="mb-[6px] flex items-center justify-between gap-3">
        <span className="text-xs text-[#64748b]">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1a3c6e]">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-[26px] font-semibold leading-[1.3] text-[#0f172a]">{value}</div>
      {note && <div className="mt-1 text-[11px] text-[#64748b]">{note}</div>}
    </article>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const classes =
    priority === "CRITICAL"
      ? "bg-[#fee2e2] text-[#b91c1c]"
      : priority === "HIGH"
        ? "bg-[#fff7ed] text-[#c2410c]"
        : priority === "MEDIUM"
          ? "bg-[#dbeafe] text-[#1d4ed8]"
          : "bg-[#f3f4f6] text-[#374151]"

  return <span className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${classes}`}>{priority || "LOW"}</span>
}

export function DashboardTeamPage() {
  const pollMs = 15_000
  const queryClient = useQueryClient()
  const user = useAuthStore((state: any) => state.user)

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
    refetchInterval: pollMs,
    refetchOnWindowFocus: true,
  })

  const allProjectIds: string[] = useMemo(() => (projects as any[]).map((project) => String(project.id)), [projects])

  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets", user?.id],
    queryFn: async () => (await timesheetsApi.getAll({ user: user?.id || "" } as any)).data,
    enabled: !!user?.id,
    refetchInterval: pollMs,
    refetchOnWindowFocus: true,
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => (await expensesApi.getAll({ user: user?.id || "" } as any)).data,
    enabled: !!user?.id,
    refetchInterval: pollMs,
    refetchOnWindowFocus: true,
  })

  const { data: myTasks = [], isFetching: isFetchingTasks } = useQuery({
    queryKey: ["team-myTasks-allProjects", user?.id, allProjectIds],
    queryFn: async () => {
      if (!user?.id) return []

      const normalizeList = (raw: any): any[] => {
        if (Array.isArray(raw)) return raw
        if (raw && Array.isArray(raw.tasks)) return raw.tasks
        return []
      }

      let fromProjects: any[] = []
      if (allProjectIds.length > 0) {
        const perProject = await Promise.all(
          allProjectIds.map(async (projectId) => {
            const response = await tasksApi.getByProject(projectId)
            return normalizeList(response.data)
          }),
        )
        fromProjects = perProject.flat()
      }

      let fromAll: any[] = []
      if ((!fromProjects || fromProjects.length === 0) && (tasksApi as any).getAll) {
        try {
          const responseAll = await (tasksApi as any).getAll({ assigneeId: user.id })
          fromAll = normalizeList(responseAll.data)
        } catch {
          // Global task endpoint is optional in this app.
        }
      }

      const combined = (fromProjects.length ? fromProjects : fromAll) || []
      const mine = combined.filter((task: any) => {
        const assigneeId = String(task.assigneeId || task.assignee?.id || "")
        return assigneeId && assigneeId === String(user.id)
      })

      const byId = new Map((projects as any[]).map((project) => [String(project.id), project]))
      return mine.map((task: any) => {
        const project = byId.get(String(task.projectId)) || {}
        return {
          ...task,
          _projectCode: project.code || "",
          _projectName: project.name || "",
          _estimateHours: Number(task.estimateHours ?? 0),
        }
      })
    },
    enabled: !!user?.id,
    refetchInterval: pollMs,
    refetchOnWindowFocus: true,
  })

  const todayHours = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return (timesheets as any[])
      .filter((timesheet) => (timesheet.workDate || "").startsWith(today))
      .reduce((sum, timesheet) => sum + (Number(timesheet.durationHours) || 0), 0)
  }, [timesheets])

  const grouped = useMemo(() => {
    const map: Record<TaskState, any[]> = { NEW: [], IN_PROGRESS: [], BLOCKED: [], DONE: [] }
    ;(myTasks as any[]).forEach((task) => {
      const state = ((task.state as TaskState) || "NEW") as TaskState
      ;(map[state] ?? map.NEW).push(task)
    })
    return map
  }, [myTasks])

  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskState | null>(null)

  const moveMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: TaskState }) => tasksApi.move(id, state),
    onMutate: async ({ id, state }) => {
      const queryKey = ["team-myTasks-allProjects", user?.id, allProjectIds] as const
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData<any[]>(queryKey) || []
      queryClient.setQueryData<any[]>(queryKey, (old = []) => old.map((task) => (task.id === id ? { ...task, state } : task)))
      return { prev, queryKey }
    },
    onError: (_error, _variables, context) => {
      if (context?.prev && context?.queryKey) queryClient.setQueryData(context.queryKey, context.prev)
    },
    onSettled: () => {
      const queryKey = ["team-myTasks-allProjects", user?.id, allProjectIds] as const
      queryClient.invalidateQueries({ queryKey })
      allProjectIds.forEach((projectId) => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }))
    },
  })

  function onDragStart(event: React.DragEvent, taskId: string) {
    setDragTaskId(taskId)
    event.dataTransfer.setData("text/plain", taskId)
  }

  function onDrop(_event: React.DragEvent, targetState: TaskState) {
    const id = dragTaskId
    setDragTaskId(null)
    setDragOverCol(null)
    if (!id) return
    moveMutation.mutate({ id, state: targetState })
  }

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">Team dashboard</div>
              <h1 className="mt-2 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0f172a]">My work</h1>
              <p className="mt-2 text-sm leading-[1.6] text-[#64748b]">
                Welcome back{user?.fullName ? `, ${user.fullName}` : ""}. Track assigned work and move tasks through delivery.
              </p>
            </div>
            {isFetchingTasks && <span className="text-xs text-[#64748b]">Refreshing tasks...</span>}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="My tasks" value={(myTasks as any[]).length} note="Across active projects" icon={ListChecks} />
          <KpiCard label="Hours logged today" value={todayHours} note="Submitted timesheets" icon={ClockIcon} />
          <KpiCard label="Billable hours" value="--" note="Pending calculation" icon={DollarSign} />
          <KpiCard label="Expenses submitted" value={(expenses as any[]).length} note="Current expense records" icon={Receipt} />
        </section>

        <section className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="border-b border-[#e2e8f0] px-6 py-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">Kanban</div>
            <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">My tasks across projects</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((column) => (
              <div
                key={column}
                className={`min-h-[320px] rounded-xl border bg-[#f8fafc] p-4 transition ${
                  dragOverCol === column ? "border-[#1a3c6e] shadow-[0_0_0_3px_rgba(26,60,110,0.12)]" : "border-[#e2e8f0]"
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => setDragOverCol(column)}
                onDragLeave={() => setDragOverCol((current) => (current === column ? null : current))}
                onDrop={(event) => onDrop(event, column)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">{columnLabels[column]}</h3>
                  <span className="rounded-full bg-white px-[10px] py-[3px] text-[11px] font-medium text-[#64748b]">
                    {grouped[column].length}
                  </span>
                </div>

                <div className="space-y-3">
                  {grouped[column].map((task: any) => (
                    <article
                      key={task.id}
                      className="cursor-move rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition hover:border-[#bfdbfe]"
                      draggable
                      onDragStart={(event) => onDragStart(event, task.id)}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-[#0f172a]">{task.title}</p>
                        <span className="shrink-0 text-[10px] text-[#64748b]">{task._projectCode || task._projectName || ""}</span>
                      </div>

                      {task.description && <p className="line-clamp-2 text-xs leading-[1.6] text-[#64748b]">{task.description}</p>}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <PriorityBadge priority={task.priority} />
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#64748b]">
                            {Number(task._estimateHours) ? `${Number(task._estimateHours)}h` : "-"}
                          </span>
                          <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">
                            Mine
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}

                  {grouped[column].length === 0 && (
                    <div className="rounded-lg border border-dashed border-[#d1d5db] bg-white p-4 text-center text-xs text-[#94a3b8]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardTeamPage

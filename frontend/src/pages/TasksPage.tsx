import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { tasksApi } from "@/api/tasks"
import { usersApi } from "@/api/users"
import type { Project, Task, User } from "@/types"
import { AlertTriangle, CheckCircle2, Clock3, KanbanSquare, Plus, UserRoundCheck } from "lucide-react"

const columns: Task["state"][] = ["NEW", "IN_PROGRESS", "BLOCKED", "DONE"]

const columnLabels: Record<Task["state"], string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  DONE: "Done",
}

function PriorityBadge({ priority }: { priority?: Task["priority"] }) {
  const level = priority || "LOW"
  const classes =
    level === "CRITICAL"
      ? "bg-[#fee2e2] text-[#b91c1c]"
      : level === "HIGH"
        ? "bg-[#fff7ed] text-[#c2410c]"
        : level === "MEDIUM"
          ? "bg-[#dbeafe] text-[#1d4ed8]"
          : "bg-[#f3f4f6] text-[#374151]"

  return <span className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${classes}`}>{level}</span>
}

function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  note: string
  icon: typeof KanbanSquare
  tone: { card: string; icon: string; value: string; strip: string }
}) {
  return (
    <article className={`relative overflow-hidden rounded-xl border border-[#d8e3f2] ${tone.card} p-[18px] shadow-[0_6px_18px_rgba(15,42,82,0.06)]`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${tone.strip}`} />
      <div className="mb-[6px] flex items-center justify-between gap-3">
        <span className="text-xs text-[#64748b]">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className={`text-[26px] font-semibold leading-[1.3] ${tone.value}`}>{value}</div>
      <div className="mt-1 text-[11px] text-[#64748b]">{note}</div>
    </article>
  )
}

export function TasksPage() {
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Task["state"] | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "MEDIUM",
    estimateHours: 1,
    assigneeId: "",
    state: "NEW",
  })

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
  })

  const activeProjectId = selectedProjectId || (projects as Project[])[0]?.id || ""
  const activeProject = (projects as Project[]).find((project) => project.id === activeProjectId)

  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ["tasks", activeProjectId],
    queryFn: async () => (activeProjectId ? (await tasksApi.getByProject(activeProjectId)).data : []),
    enabled: !!activeProjectId,
  })

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await usersApi.getMe()).data,
  })

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })

  const role = String(me?.role || localStorage.getItem("userRole") || "").toUpperCase()
  const canManageTasks = role === "ADMIN" || role === "PROJECT_MANAGER"
  const assignableUsers = (users as User[]) || []

  const grouped = useMemo(() => {
    const map: Record<Task["state"], Task[]> = { NEW: [], IN_PROGRESS: [], BLOCKED: [], DONE: [] }
    ;(tasks as Task[]).forEach((task) => {
      ;(map[task.state] ?? map.NEW).push(task)
    })
    return map
  }, [tasks])

  const summary = useMemo(() => {
    const rows = tasks as Task[]
    const total = rows.length
    const done = rows.filter((task) => task.state === "DONE").length
    const blocked = rows.filter((task) => task.state === "BLOCKED").length
    const estimate = rows.reduce((sum, task) => sum + Number(task.estimateHours || 0), 0)
    return { total, done, blocked, estimate }
  }, [tasks])

  const moveMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: Task["state"] }) => tasksApi.move(id, state),
    onMutate: async ({ id, state }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", activeProjectId] })
      const previous = queryClient.getQueryData<Task[]>(["tasks", activeProjectId]) || []
      queryClient.setQueryData<Task[]>(["tasks", activeProjectId], (old = []) =>
        old.map((task) => (task.id === id ? { ...task, state } : task)),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", activeProjectId], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks", activeProjectId] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", activeProjectId] }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => {
      const estimate =
        data.estimateHours === undefined || data.estimateHours === null || (data.estimateHours as any) === ""
          ? undefined
          : Number(data.estimateHours)

      return tasksApi.create(activeProjectId, {
        ...data,
        estimateHours: estimate,
        assigneeId: data.assigneeId || undefined,
        state: "NEW",
      })
    },
    onSuccess: () => {
      setShowCreate(false)
      setNewTask({ title: "", description: "", priority: "MEDIUM", estimateHours: 1, assigneeId: "", state: "NEW" })
      queryClient.invalidateQueries({ queryKey: ["tasks", activeProjectId] })
    },
  })

  const userLabel = (user: Partial<User>) => user.fullName || user.email || "Unknown"

  function onDragStart(event: React.DragEvent, taskId: string) {
    setDragTaskId(taskId)
    event.dataTransfer.setData("text/plain", taskId)
  }

  function onDrop(_event: React.DragEvent, targetState: Task["state"]) {
    const id = dragTaskId
    setDragTaskId(null)
    setDragOverCol(null)
    if (!id) return
    moveMutation.mutate({ id, state: targetState })
  }

  function handleAssigneeChange(taskId: string, assigneeId: string) {
    if (!canManageTasks) return
    updateMutation.mutate({ id: taskId, data: { assigneeId: assigneeId || undefined } })
  }

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-64 opacity-35 md:block">
            <svg viewBox="0 0 256 128" fill="none" className="h-full w-full">
              <rect x="24" y="22" width="74" height="52" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="130" y="58" width="90" height="48" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M90 48C116 36 142 40 164 58" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="90" cy="48" r="5" fill="#bfdbfe" />
              <circle cx="164" cy="58" r="5" fill="#93c5fd" />
              <path d="M44 48L54 58L76 36" stroke="rgba(255,255,255,0.74)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="150" y="78" width="46" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <rect x="150" y="91" width="34" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Tasks
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Task operations
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Plan, assign, and move project tasks through a focused delivery board.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">
                  {activeProject?.code || "No project selected"}
                </span>
                <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                  {summary.total} tasks
                </span>
                <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">
                  {summary.done} done
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                className="h-10 min-w-64 rounded-lg border border-white/20 bg-white px-3 text-sm text-[#0f172a] outline-none"
                value={activeProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
              >
                {(projects as Project[]).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
              {canManageTasks && (
                <button
                  type="button"
                  onClick={() => setShowCreate((current) => !current)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa]"
                >
                  <Plus className="h-4 w-4" />
                  {showCreate ? "Close form" : "New task"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total tasks"
            value={summary.total}
            note="Current project board"
            icon={KanbanSquare}
            tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
          />
          <KpiCard
            label="In progress"
            value={grouped.IN_PROGRESS.length}
            note="Actively moving"
            icon={Clock3}
            tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
          />
          <KpiCard
            label="Blocked"
            value={summary.blocked}
            note="Needs attention"
            icon={AlertTriangle}
            tone={{ card: "bg-[#fee2e2]", icon: "bg-white text-[#b91c1c]", value: "text-[#7f1d1d]", strip: "bg-[#dc2626]" }}
          />
          <KpiCard
            label="Estimate"
            value={`${summary.estimate}h`}
            note="Total planned hours"
            icon={CheckCircle2}
            tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }}
          />
        </section>

        {canManageTasks && showCreate && (
          <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Create</div>
              <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">New task</h2>
            </div>
            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_1.4fr_160px_140px_220px_auto]">
              <input
                className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                placeholder="Task title"
                value={newTask.title || ""}
                onChange={(event) => setNewTask((task) => ({ ...task, title: event.target.value }))}
              />
              <input
                className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                placeholder="Description"
                value={newTask.description || ""}
                onChange={(event) => setNewTask((task) => ({ ...task, description: event.target.value }))}
              />
              <select
                className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                value={newTask.priority || "MEDIUM"}
                onChange={(event) => setNewTask((task) => ({ ...task, priority: event.target.value as Task["priority"] }))}
              >
                {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Task["priority"][]).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <input
                className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                type="number"
                min={0}
                step={0.5}
                placeholder="Hours"
                value={(newTask.estimateHours as number | string | undefined) ?? ""}
                onChange={(event) =>
                  setNewTask((task) => ({
                    ...task,
                    estimateHours: event.target.value === "" ? ("" as any) : Number(event.target.value),
                  }))
                }
              />
              <select
                className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                value={newTask.assigneeId || ""}
                onChange={(event) => setNewTask((task) => ({ ...task, assigneeId: event.target.value || undefined }))}
              >
                <option value="">Unassigned</option>
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {userLabel(user)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1a3c6e] px-5 text-sm font-medium text-white transition hover:bg-[#15325d] disabled:cursor-wait disabled:opacity-70"
                onClick={() => createMutation.mutate(newTask)}
                disabled={!newTask.title || !activeProjectId || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
          <div className="flex flex-col gap-3 border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Board</div>
              <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">
                {activeProject ? activeProject.name : projectsLoading ? "Loading project..." : "No project selected"}
              </h2>
            </div>
            {isFetching && <span className="text-xs text-[#64748b]">Refreshing tasks...</span>}
          </div>

          {!activeProjectId ? (
            <div className="p-10 text-center text-sm text-[#64748b]">Select or create a project to manage tasks.</div>
          ) : (
            <div className="grid gap-4 p-5 lg:grid-cols-2 2xl:grid-cols-4">
              {columns.map((column) => (
                <div
                  key={column}
                  className={`min-h-[360px] rounded-xl border bg-[#f8fafc] p-4 transition ${
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
                    {grouped[column].map((task) => (
                      <article
                        key={task.id}
                        className="cursor-move rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition hover:border-[#bfdbfe]"
                        draggable
                        onDragStart={(event) => onDragStart(event, task.id)}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#0f172a]">{task.title}</p>
                            {task.description && <p className="mt-1 line-clamp-2 text-xs leading-[1.6] text-[#64748b]">{task.description}</p>}
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#e2e8f0] pt-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748b]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {Number(task.estimateHours) ? `${Number(task.estimateHours)}h` : "No estimate"}
                          </span>

                          {canManageTasks ? (
                            <select
                              className="h-8 max-w-36 rounded-lg border border-[#e2e8f0] bg-white px-2 text-xs text-[#64748b] outline-none focus:border-[#1a3c6e]"
                              value={task.assigneeId || ""}
                              onChange={(event) => handleAssigneeChange(task.id, event.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {assignableUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {userLabel(user)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-[10px] py-[3px] text-[11px] font-medium text-[#374151]">
                              <UserRoundCheck className="h-3.5 w-3.5" />
                              {task.assignee?.fullName || "Assigned"}
                            </span>
                          )}
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
          )}
        </section>
      </div>
    </div>
  )
}

export default TasksPage

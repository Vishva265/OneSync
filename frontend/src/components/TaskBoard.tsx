import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/api/tasks"
import { usersApi } from "@/api/users"
import type { Task, User } from "@/types"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

export function TaskBoard({
  projectId,
  teamMembers,
}: {
  projectId: string
  teamMembers?: User[]
}) {
  const queryClient = useQueryClient()
  const columns: Task["state"][] = ["NEW", "IN_PROGRESS", "BLOCKED", "DONE"]

  // Tasks
  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => (await tasksApi.getByProject(projectId)).data,
  })

  // Current user (for role-based permissions)
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await usersApi.getMe()).data,
  })
  const role = (me?.role ?? "").toUpperCase()
  const canChangeAssignee = role === "ADMIN" || role === "PROJECT_MANAGER"
  const canCreateTask = canChangeAssignee

  // All users (assignment list)
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })
  const assignableUsers: User[] = (users as User[]) ?? []

  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Task["state"] | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    assigneeId: "",
    priority: "MEDIUM",
    estimateHours: 1,
    state: "NEW",
  })

  // Group by state
  const grouped = useMemo(() => {
    const map: Record<Task["state"], Task[]> = {
      NEW: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      DONE: [],
    }
    for (const t of tasks as Task[]) map[t.state].push(t)
    return map
  }, [tasks])

  // Move between columns
  const moveMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: Task["state"] }) =>
      tasksApi.move(id, state),
    onMutate: async ({ id, state }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] })
      const prev = queryClient.getQueryData<Task[]>(["tasks", projectId]) || []
      queryClient.setQueryData<Task[]>(["tasks", projectId], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, state } : t)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks", projectId], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  })

  // Update task (assignee change etc.)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  })

  // Create task (always NEW)
  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => {
      if (!canCreateTask) {
        return Promise.reject(new Error("Only Admin/Manager can create tasks"))
      }
      const estimate =
        data.estimateHours === undefined ||
        data.estimateHours === null ||
        (data.estimateHours as any) === ""
          ? undefined
          : Number(data.estimateHours)

      return tasksApi.create(projectId, { ...data, estimateHours: estimate, state: "NEW" })
    },
    onSuccess: (res) => {
      const created = res.data
      queryClient.setQueryData(["tasks", projectId], (old: any = []) => [created, ...old])
      setShowCreate(false)
      setNewTask({
        title: "",
        description: "",
        assigneeId: "",
        priority: "MEDIUM",
        estimateHours: 1,
        state: "NEW",
      })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    },
  })

  // DnD
  function onDragStart(e: React.DragEvent, taskId: string) {
    setDragTaskId(taskId)
    e.dataTransfer.setData("text/plain", taskId)
  }
  function onDrop(_e: React.DragEvent, targetState: Task["state"]) {
    const id = dragTaskId
    setDragTaskId(null)
    setDragOverCol(null)
    if (!id) return
    moveMutation.mutate({ id, state: targetState })
  }

  // Helpers
  const userLabel = (u: Partial<User>) => u.fullName || (u as any).name || u.email || "Unknown"
  const filteredUsers = assignableUsers.filter((u) =>
    userLabel(u).toLowerCase().includes(assigneeFilter.toLowerCase()),
  )

  function handleAssigneeChange(taskId: string, newAssigneeId: string) {
    if (!canChangeAssignee) return
    updateMutation.mutate({
      id: taskId,
      data: { assigneeId: newAssigneeId || undefined },
    })
  }

  return (
    <div className="min-h-[200px] space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isFetching ? "Refreshing tasks…" : ""}
        </div>
        {canCreateTask && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? "Cancel" : "+ New Task"}
          </Button>
        )}
      </div>

      {/* Create form (Admins/PMs) */}
      {canCreateTask && showCreate && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Task Title"
              value={newTask.title || ""}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
            />

            <input
              className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description"
              value={newTask.description || ""}
              onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
            />

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newTask.priority || "MEDIUM"}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, priority: e.target.value as Task["priority"] }))
              }
            >
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Task["priority"][]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Estimate Hours */}
            <input
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="number"
              min={0}
              step={0.5}
              placeholder="Estimate (hrs)"
              value={(newTask.estimateHours as number | string | undefined) ?? ""}
              onChange={(e) =>
                setNewTask((t) => ({
                  ...t,
                  estimateHours: e.target.value === "" ? ("" as any) : Number(e.target.value),
                }))
              }
              title="Estimated effort in hours"
            />

            {/* Assignee picker */}
            <select
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !canChangeAssignee ? "opacity-70 cursor-not-allowed" : ""
              }`}
              title={canChangeAssignee ? "Select assignee" : "Only Admin/Manager can assign a user"}
              disabled={!canChangeAssignee}
              value={newTask.assigneeId || ""}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, assigneeId: e.target.value || undefined }))
              }
            >
              <option value="" disabled>
                Select assignee
              </option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {userLabel(u)} {(u as any).role ? `(${(u as any).role})` : ""}
                </option>
              ))}
            </select>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={() => createMutation.mutate(newTask)}
              disabled={!newTask.title || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column}
            className={`rounded-xl p-4 min-h-[320px] bg-white border transition
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
              {grouped[column].map((task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-md cursor-move rounded-lg border border-gray-200 transition-shadow"
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className="font-medium text-sm text-gray-900">{task.title}</p>
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

                      {/* Assignee dropdown */}
                      <select
                        className={`text-xs border rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !canChangeAssignee ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        title={
                          canChangeAssignee
                            ? "Change assignee"
                            : "Only Admin/Manager can change assignee"
                        }
                        disabled={!canChangeAssignee}
                        value={task.assigneeId || ""}
                        onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                      >
                        {!task.assigneeId && (
                          <option value="" disabled>
                            Select assignee
                          </option>
                        )}
                        {assignableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {userLabel(u)}
                          </option>
                        ))}
                      </select>
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
  )
}

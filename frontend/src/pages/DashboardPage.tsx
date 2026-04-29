import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQueries, useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { tasksApi } from "@/api/tasks"
import { usersApi } from "@/api/users"
import { useAuthStore } from "@/store/auth"
import { Briefcase, Clock, DollarSign, Plus, TrendingUp } from "lucide-react"

function k(n: number) {
  if (!isFinite(n)) return "$0"
  return `$${(n / 1000).toFixed(1)}K`
}

const num = (value: any) => {
  const parsed = Number(value)
  return isFinite(parsed) ? parsed : 0
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE"
  return (
    <span
      className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${
        active ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#f3f4f6] text-[#374151]"
      }`}
    >
      {status || "DRAFT"}
    </span>
  )
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  note?: string
  icon: typeof Briefcase
  tone: {
    card: string
    icon: string
    value: string
    strip: string
  }
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
      {note && <div className="mt-1 text-[11px] text-[#64748b]">{note}</div>}
    </article>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)

  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await usersApi.getMe()).data,
    enabled: !storeUser?.id,
    staleTime: 5 * 60 * 1000,
  })

  const meFromLS = (() => {
    try {
      return JSON.parse(localStorage.getItem("me") || "null")
    } catch {
      return null
    }
  })()
  const roleFromLS = (localStorage.getItem("userRole") || "").toUpperCase()
  const user = storeUser ?? meData ?? meFromLS ?? null
  const role = ((user?.role || roleFromLS || "") as string).toUpperCase()
  const isTeam = role === "TEAM_MEMBER"
  const isPMOrAdmin = role === "PROJECT_MANAGER" || role === "ADMIN"

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
  })

  const visibleProjects = useMemo(() => {
    if (!isTeam) return projects as any[]
    return (projects as any[]).filter((project) =>
      Array.isArray(project.teamMembers)
        ? project.teamMembers.some((member: any) => member.user?.id === user?.id || member.id === user?.id)
        : true,
    )
  }, [projects, isTeam, user?.id])

  const projectIds = useMemo(() => (visibleProjects as any[]).map((project) => project.id), [visibleProjects])

  const tasksQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ["tasks", projectId],
      queryFn: async () => (await tasksApi.getByProject(projectId)).data,
      enabled: projectIds.length > 0,
    })),
  })

  const tasksByProject: Record<string, any[]> = useMemo(() => {
    const map: Record<string, any[]> = {}
    projectIds.forEach((projectId, index) => {
      map[projectId] = (tasksQueries[index]?.data as any[]) || []
    })
    return map
  }, [projectIds, tasksQueries])

  const totalHoursLogged = useMemo(() => {
    let total = 0
    for (const projectId of projectIds) {
      const list = tasksByProject[projectId] || []
      for (const task of list) {
        const isDone = (task.state || "").toUpperCase() === "DONE"
        if (!isDone) continue
        if (isTeam && task.assigneeId !== user?.id) continue
        total += num(task.estimateHours)
      }
    }
    return total
  }, [projectIds, tasksByProject, isTeam, user?.id])

  const finQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ["project-financials", projectId],
      queryFn: async () => (await projectsApi.getFinancials(projectId)).data,
      enabled: projectIds.length > 0,
    })),
  })

  const totalRevenue = useMemo(() => {
    return finQueries.reduce((sum, query) => sum + num(query.data?.revenue || 0), 0)
  }, [finQueries])

  function projectProgress(projectId: string) {
    const list = tasksByProject[projectId] || []
    const total = list.reduce((sum, task) => sum + num(task.estimateHours), 0)
    const done = list
      .filter((task) => (task.state || "").toUpperCase() === "DONE")
      .reduce((sum, task) => sum + num(task.estimateHours), 0)
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
    return { pct, done, total }
  }

  const activeProjects = (visibleProjects as any[]).filter((project) => project.status === "ACTIVE").length
  const totalBudget = (visibleProjects as any[]).reduce((sum, project) => sum + num(project.budgetAmount), 0)
  const roleResolved = !!role
  const canShowAdminBits = roleResolved && isPMOrAdmin

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-64 opacity-35 md:block">
            <svg viewBox="0 0 256 128" fill="none" className="h-full w-full">
              <rect x="22" y="56" width="88" height="48" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.32)" />
              <rect x="144" y="18" width="82" height="52" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.32)" />
              <path d="M62 56C88 22 126 8 178 18" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <path d="M108 82C136 98 164 96 196 70" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5 8" strokeLinecap="round" />
              <circle cx="62" cy="56" r="5" fill="#bfdbfe" />
              <circle cx="178" cy="18" r="5" fill="#93c5fd" />
              <rect x="40" y="74" width="44" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <rect x="40" y="87" width="54" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
              <rect x="160" y="36" width="42" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <rect x="160" y="49" width="34" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
            </svg>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative z-10">
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Dashboard
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Project operations
              </h1>
              <p className="mt-2 text-sm leading-[1.6] text-white/72">
                Welcome back, <span className="font-medium text-white">{user?.fullName || user?.email || "user"}</span>. Monitor delivery, budget and approvals in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">Live workspace</span>
                <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">{activeProjects} active</span>
                <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">{visibleProjects.length} total projects</span>
              </div>
            </div>

            {canShowAdminBits ? (
              <button
                type="button"
                onClick={() => navigate("/projects/new")}
                className="relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa]"
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            ) : meLoading ? (
              <button
                type="button"
                disabled
                className="inline-flex h-10 cursor-wait items-center justify-center rounded-lg border border-[#e2e8f0] px-5 text-sm font-medium text-[#64748b]"
              >
                Loading...
              </button>
            ) : null}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active projects"
            value={activeProjects}
            note="Currently in delivery"
            icon={Briefcase}
            tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
          />
          <StatCard
            label="Total hours logged"
            value={totalHoursLogged}
            note={isTeam ? "Done hours on my tasks" : "Done hours across all tasks"}
            icon={Clock}
            tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }}
          />
          <StatCard
            label="Revenue this month"
            value={k(totalRevenue)}
            note="Project financials"
            icon={DollarSign}
            tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
          />
          <StatCard
            label="Total budget"
            value={`$${(totalBudget / 1000).toFixed(0)}K`}
            note="Visible projects"
            icon={TrendingUp}
            tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
          <div className="flex flex-col gap-3 border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Projects</div>
              <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">Current portfolio</h2>
            </div>
            {canShowAdminBits && (
              <button
                type="button"
                onClick={() => navigate("/projects/new")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-[1.5px] border-[#1a3c6e] px-4 text-sm font-medium text-[#1a3c6e] transition hover:bg-[rgba(26,60,110,0.08)]"
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            )}
          </div>

          {projectsLoading ? (
            <div className="p-10 text-center text-sm text-[#64748b]">Loading projects...</div>
          ) : (visibleProjects as any[]).length === 0 ? (
            <div className="p-10 text-center text-sm text-[#64748b]">No projects found.</div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {(visibleProjects as any[]).map((project) => {
                const progress = projectProgress(project.id)
                return (
                  <Link key={project.id} to={`/projects/${project.id}`} className="block">
                    <article className="h-full overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_4px_16px_rgba(15,42,82,0.05)] transition hover:-translate-y-0.5 hover:border-[#bfdbfe] hover:shadow-[0_10px_26px_rgba(15,42,82,0.10)]">
                      <div className="h-1 bg-[#1a3c6e]" />
                      <div className="p-[18px]">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="inline-flex rounded bg-[#eff6ff] px-2 py-1 text-xs text-[#1a3c6e]">{project.code}</div>
                          <h3 className="mt-1 truncate text-base font-medium text-[#0f172a]">{project.name}</h3>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-[#64748b]">Progress</span>
                        <span className="font-medium text-[#0f172a]">{progress.pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                        <div className="h-full rounded-full bg-[#1a3c6e]" style={{ width: `${progress.pct}%` }} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e2e8f0] pt-4">
                        <div>
                          <div className="text-[11px] text-[#94a3b8]">Hours</div>
                          <div className="text-[13px] font-medium text-[#0f172a]">
                            {progress.done}/{progress.total || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#94a3b8]">Budget</div>
                          <div className="text-[13px] font-medium text-[#0f172a]">
                            {project.budgetAmount ? `$${num(project.budgetAmount).toLocaleString()}` : "-"}
                          </div>
                        </div>
                      </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {isTeam && <TeamPanels tasksByProject={tasksByProject} userId={user?.id} />}
      </div>
    </div>
  )
}

function TeamPanels({ tasksByProject, userId }: { tasksByProject: Record<string, any[]>; userId?: string }) {
  const myTasks = useMemo(() => {
    const out: any[] = []
    Object.values(tasksByProject).forEach((tasks) => {
      tasks.forEach((task) => {
        if (task.assigneeId === userId) out.push(task)
      })
    })
    return out
  }, [tasksByProject, userId])

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:col-span-2">
        <div className="border-b border-[#e2e8f0] px-6 py-5">
          <h2 className="text-xl font-semibold text-[#0f172a]">My tasks</h2>
        </div>
        <div className="space-y-3 p-6">
          {myTasks.length === 0 && <p className="text-sm text-[#64748b]">No tasks assigned yet.</p>}
          {myTasks.slice(0, 8).map((task: any) => (
            <div key={task.id} className="flex items-start justify-between rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#0f172a]">{task.title}</p>
                {task.description && <p className="line-clamp-1 text-sm text-[#64748b]">{task.description}</p>}
              </div>
              <span className="ml-3 shrink-0 rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                {task.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">Quick actions</div>
        <h2 className="mt-2 text-xl font-semibold text-[#0f172a]">Keep work moving</h2>
        <p className="mt-2 text-sm leading-[1.6] text-[#64748b]">Jump back into your recent task activity.</p>
        <div className="mt-5 flex flex-col gap-2">
          <button className="h-10 rounded-lg bg-[#1a3c6e] px-4 text-sm font-medium text-white transition hover:bg-[#15325d]">
            Create task
          </button>
          <button className="h-10 rounded-lg border-[1.5px] border-[#1a3c6e] px-4 text-sm font-medium text-[#1a3c6e] transition hover:bg-[rgba(26,60,110,0.08)]">
            View all tasks
          </button>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage

import { useMemo } from "react"
import { useQuery, useQueries } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { tasksApi } from "@/api/tasks"
import { usersApi } from "@/api/users"
import { useAuthStore } from "@/store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { TrendingUp, Briefcase, Clock, DollarSign } from "lucide-react"

// helper: nice $K format
function k(n: number) {
  if (!isFinite(n)) return "$0"
  return `$${(n / 1000).toFixed(1)}K`
}
const num = (v: any) => {
  const n = Number(v)
  return isFinite(n) ? n : 0
}

export function DashboardPage() {
  const navigate = useNavigate()
  const storeUser = useAuthStore((s) => s.user)

  // Fetch /me if storeUser is not present yet (typical after a hard refresh)
  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await usersApi.getMe()).data,
    enabled: !storeUser?.id, // only fetch if we don't already have a user in the store
    staleTime: 5 * 60 * 1000,
  })

  // Fallbacks from localStorage so UI doesn't hide admin bits on the first paint
  const meFromLS = (() => {
    try {
      return JSON.parse(localStorage.getItem("me") || "null")
    } catch {
      return null
    }
  })()
  const roleFromLS = (localStorage.getItem("userRole") || "").toUpperCase()

  // Choose user in this priority: store -> query -> localStorage
  const user = storeUser ?? meData ?? meFromLS ?? null

  // Resolve role similarly (uppercase for safe compare)
  const role = ((user?.role || roleFromLS || "") as string).toUpperCase()
  const isTeam = role === "TEAM_MEMBER"
  const isPMOrAdmin = role === "PROJECT_MANAGER" || role === "ADMIN"

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
  })

  // Visible projects:
  const visibleProjects = useMemo(() => {
    if (!isTeam) return projects as any[]
    return (projects as any[]).filter((p) =>
      Array.isArray(p.teamMembers)
        ? p.teamMembers.some((m: any) => m.user?.id === user?.id || m.id === user?.id)
        : true,
    )
  }, [projects, isTeam, user?.id])

  const projectIds = useMemo(() => (visibleProjects as any[]).map((p) => p.id), [visibleProjects])

  // Fetch tasks per project (to compute progress + hours)
  const tasksQueries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["tasks", pid],
      queryFn: async () => (await tasksApi.getByProject(pid)).data,
      enabled: projectIds.length > 0,
    })),
  })

  // Build a map: projectId -> tasks[]
  const tasksByProject: Record<string, any[]> = useMemo(() => {
    const map: Record<string, any[]> = {}
    projectIds.forEach((pid, idx) => {
      map[pid] = (tasksQueries[idx]?.data as any[]) || []
    })
    return map
  }, [projectIds, tasksQueries])

  // Compute hours logged (DONE tasks’ estimateHours)
  const totalHoursLogged = useMemo(() => {
    let total = 0
    for (const pid of projectIds) {
      const list = tasksByProject[pid] || []
      for (const t of list) {
        const isDone = (t.state || "").toUpperCase() === "DONE"
        if (!isDone) continue
        if (isTeam && t.assigneeId !== user?.id) continue
        total += num(t.estimateHours)
      }
    }
    return total
  }, [projectIds, tasksByProject, isTeam, user?.id])

  // Financials per project for Revenue KPI
  const finQueries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["project-financials", pid],
      queryFn: async () => (await projectsApi.getFinancials(pid)).data,
      enabled: projectIds.length > 0,
    })),
  })

  const totalRevenue = useMemo(() => {
    return finQueries.reduce((sum, q) => sum + num(q.data?.revenue || 0), 0)
  }, [finQueries])

  function projectProgress(pid: string) {
    const list = tasksByProject[pid] || []
    const total = list.reduce((s, t) => s + num(t.estimateHours), 0)
    const done = list
      .filter((t) => (t.state || "").toUpperCase() === "DONE")
      .reduce((s, t) => s + num(t.estimateHours), 0)
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
    return { pct, done, total }
  }

  const activeProjects = (visibleProjects as any[]).filter((p) => p.status === "ACTIVE").length
  const totalBudget = (visibleProjects as any[]).reduce((sum, p) => sum + num(p.budgetAmount), 0)

  const handleNewProject = () => navigate("/projects/new")

  // If we truly don't know the role yet, avoid hiding admin UI prematurely
  const roleResolved = !!role // or use (!meLoading)
  const canShowAdminBits = roleResolved && isPMOrAdmin

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back,{" "}
              <span className="font-medium text-gray-900">
                {user?.fullName || user?.email || "—"}
              </span>
            </p>
          </div>

          {canShowAdminBits ? (
            <Button
              onClick={handleNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              New Project
            </Button>
          ) : meLoading ? (
            // while resolving role, show a disabled placeholder to avoid layout shift
            <Button disabled className="bg-gray-200 text-gray-500 rounded-lg cursor-wait">
              Loading…
            </Button>
          ) : null}
        </div>

        {/* KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
                  <Briefcase className="w-4 h-4 text-blue-700" />
                </span>
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-700" />
                </span>
                Total Hours Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{totalHoursLogged}</p>
              <p className="text-xs text-gray-500 mt-1">
                {isTeam ? "DONE hours on my tasks" : "DONE hours across all tasks"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
                  <DollarSign className="w-4 h-4 text-blue-700" />
                </span>
                Revenue (Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{k(totalRevenue)}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                </span>
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalBudget / 1000).toFixed(0)}K
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Projects</h2>
            {canShowAdminBits ? (
              <Button
                onClick={handleNewProject}
                // FIXED: "bg-blue" → "bg-blue-600 text-white"
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                New Project
              </Button>
            ) : meLoading ? (
              <Button disabled className="bg-gray-200 text-gray-500 rounded-lg cursor-wait">
                Loading…
              </Button>
            ) : null}
          </div>

          {projectsLoading ? (
            <Card className="rounded-xl border border-dashed border-gray-300 bg-white shadow-sm">
              <CardContent className="py-10 text-center text-gray-500">
                Loading projects…
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(visibleProjects as any[]).map((project) => {
                const prog = projectProgress(project.id)
                return (
                  <Link key={project.id} to={`/projects/${project.id}`} className="block">
                    <Card className="h-full rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-mono text-gray-500">{project.code}</p>
                            <CardTitle className="text-lg text-gray-900">{project.name}</CardTitle>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              project.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{prog.pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${prog.pct}%` }}
                          />
                        </div>
                        {project.budgetAmount && (
                          <p className="text-xs text-gray-500">
                            Budget: ${num(project.budgetAmount).toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Team-only panels */}
        {isTeam && (
          <div>
            <TeamPanels tasksByProject={tasksByProject} userId={user?.id} />
          </div>
        )}
      </div>
    </div>
  )
}

// ----- TeamPanels stays the same -----
function TeamPanels({
  tasksByProject,
  userId,
}: {
  tasksByProject: Record<string, any[]>
  userId?: string
}) {
  const myTasks = useMemo(() => {
    const out: any[] = []
    Object.values(tasksByProject).forEach((arr) => {
      arr.forEach((t) => {
        if (t.assigneeId === userId) out.push(t)
      })
    })
    return out
  }, [tasksByProject, userId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
      <Card className="lg:col-span-2 rounded-xl shadow-sm border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-900">My Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myTasks.length === 0 && (
            <p className="text-sm text-gray-500">No tasks assigned yet.</p>
          )}
          {myTasks.slice(0, 8).map((t: any) => (
            <div
              key={t.id}
              className="flex items-start justify-between border rounded-lg p-3 bg-white"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{t.title}</p>
                {t.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">{t.description}</p>
                )}
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-800 ml-3 flex-shrink-0">
                {t.state}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p className="text-gray-600">Jump back into your recent work or create a task.</p>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Create Task
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg"
            >
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

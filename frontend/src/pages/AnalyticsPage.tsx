import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { timesheetsApi } from "@/api/timesheets"
import { tasksApi } from "@/api/tasks" // if you don't have this, keep the fetch fallback below

type KPI = { label: string; value: number | string }

const POLL_MS = 15_000
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9C27B0", "#4CAF50"]

export function AnalyticsPage() {
  // --- Core queries (auto-refresh) ---
  const { data: projects = [], isLoading: loadingProjects, error: errProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  const { data: timesheets = [], isLoading: loadingTs, error: errTs } = useQuery({
    queryKey: ["timesheets-all"],
    queryFn: async () => (await timesheetsApi.getAll()).data,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  // Prefer your tasksApi.getAnalytics() if available; else fallback to fetch path used earlier
  const { data: taskStatusData = [], isLoading: loadingTasks, error: errTasks } = useQuery({
    queryKey: ["analytics", "task-status"],
    queryFn: async () => {
      if ((tasksApi as any)?.getAnalytics) {
        return (await (tasksApi as any).getAnalytics()).data as Array<{ name: string; value: number }>
      }
      const res = await fetch("/api/v1/analytics/task-status")
      if (!res.ok) throw new Error("Failed to fetch analytics data")
      return (await res.json()) as Array<{ name: string; value: number }>
    },
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  // Pull per-project financials for a subset (top N) to keep it snappy
  const TOP_N = 6
  const { data: projectFinanceData = [], isLoading: loadingFin, error: errFin } = useQuery({
    queryKey: ["project-financials", projects.map((p: any) => p.id).slice(0, TOP_N)],
    queryFn: async () => {
      const first = (projects as any[]).slice(0, TOP_N)
      const entries = await Promise.all(
        first.map(async (p) => {
          const fin = (await projectsApi.getFinancials(p.id)).data || {}
          return {
            name: p.name,
            revenue: Number(fin.revenue || 0),
            cost: Number(fin.cost || 0),
          }
        }),
      )
      return entries
    },
    enabled: projects.length > 0,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  // --- Derived: KPIs ---
  const tasksDone = useMemo(
    () => Number(taskStatusData.find((t) => String(t.name).toUpperCase() === "DONE")?.value ?? 0),
    [taskStatusData],
  )

  const hoursLogged = useMemo(
    () =>
      (timesheets as any[]).reduce(
        (s, t) => s + (Number((t as any).durationHours) || 0),
        0,
      ),
    [timesheets],
  )

  const billablePct = useMemo(() => {
    // If your timesheet has a boolean `billable` (or similar), compute from that; otherwise return "--"
    const ts = timesheets as any[]
    if (!ts.length) return "—"
    const hasBillable = ts.some((t) => "billable" in t || "isBillable" in t)
    if (!hasBillable) return "—"
    const total = ts.length
    const billableCount = ts.filter((t) => (t.billable ?? t.isBillable) === true).length
    const pct = (billableCount / total) * 100
    return `${pct.toFixed(0)}%`
  }, [timesheets])

  const kpis: KPI[] = useMemo(
    () => [
      { label: "Total Projects", value: projects.length },
      { label: "Tasks Completed", value: tasksDone },
      { label: "Hours Logged", value: hoursLogged },
      { label: "Billable %", value: billablePct },
    ],
    [projects.length, tasksDone, hoursLogged, billablePct],
  )

  // --- Derived: Utilization trend (normalize monthly hours to %)
  const utilizationData = useMemo(() => {
    // Group timesheets by YYYY-MM
    const byMonth = new Map<string, number>()
    ;(timesheets as any[]).forEach((t) => {
      const d = new Date(t.workDate ?? t.date ?? t.createdAt ?? Date.now())
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const hrs = Number(t.durationHours || 0)
      byMonth.set(key, (byMonth.get(key) ?? 0) + hrs)
    })

    // Keep last 6 months sorted
    const entries = Array.from(byMonth.entries()).sort(([a], [b]) => (a < b ? -1 : 1))
    const last6 = entries.slice(-6)
    const max = Math.max(1, ...last6.map(([, v]) => v)) // avoid /0
    return last6.map(([key, v]) => ({
      month: key,
      utilization: Math.round((v / max) * 100),
    }))
  }, [timesheets])

  // --- Loading / error states ---
  const isLoading = loadingProjects || loadingTs || loadingTasks || (projects.length > 0 && loadingFin)
  const firstError = errProjects || errTs || errTasks || errFin

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (firstError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        <p>{(firstError as Error).message || "Failed to load analytics"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600 text-sm">Progress, utilization and profitability overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, percent } = props as any
                      const p = typeof percent === "number" ? percent : Number(percent)
                      return p ? `${name} ${(p * 100).toFixed(0)}%` : ""
                    }}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {taskStatusData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Finance per project */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Project Cost vs Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectFinanceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#00C49F" />
                  <Bar dataKey="cost" name="Cost" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Utilization trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Resource Utilization Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "Utilization"]} />
                  <Legend />
                  <Line type="monotone" dataKey="utilization" stroke="#0088FE" name="Utilization %" dot={{ fill: "#0088FE" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

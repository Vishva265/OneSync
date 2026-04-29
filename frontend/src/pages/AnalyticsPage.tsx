import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  Percent,
  TrendingUp,
} from "lucide-react"
import { projectsApi } from "@/api/projects"
import { timesheetsApi } from "@/api/timesheets"
import { tasksApi } from "@/api/tasks"

type KPI = {
  label: string
  value: number | string
  note: string
  icon: typeof BarChart3
  tone: { card: string; icon: string; value: string; strip: string }
}

const POLL_MS = 15_000
const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7e22ce", "#0891b2"]

const money = (value: number) => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

function KpiCard({ label, value, note, icon: Icon, tone }: KPI) {
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

function ChartPanel({
  title,
  description,
  children,
  wide = false,
}: {
  title: string
  description: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <section className={`rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)] ${wide ? "xl:col-span-2" : ""}`}>
      <div className="border-b border-[#e2e8f0] px-5 py-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748b]">Report</div>
        <h2 className="mt-1 text-lg font-semibold leading-[1.3] text-[#0f172a]">{title}</h2>
        <p className="mt-1 text-sm text-[#64748b]">{description}</p>
      </div>
      <div className="h-[320px] px-4 py-5">{children}</div>
    </section>
  )
}

export function AnalyticsPage() {
  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: errProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  const {
    data: timesheets = [],
    isLoading: loadingTs,
    error: errTs,
  } = useQuery({
    queryKey: ["timesheets-all"],
    queryFn: async () => (await timesheetsApi.getAll()).data,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  const {
    data: taskStatusData = [],
    isLoading: loadingTasks,
    error: errTasks,
  } = useQuery({
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

  const topProjectIds = useMemo(() => (projects as any[]).map((project) => project.id).slice(0, 6), [projects])

  const {
    data: projectFinanceData = [],
    isLoading: loadingFin,
    error: errFin,
  } = useQuery({
    queryKey: ["project-financials", topProjectIds],
    queryFn: async () => {
      const first = (projects as any[]).slice(0, 6)
      return Promise.all(
        first.map(async (project) => {
          const fin = (await projectsApi.getFinancials(project.id)).data || {}
          return {
            name: project.code || project.name,
            revenue: Number(fin.revenue || 0),
            cost: Number(fin.cost || 0),
            profit: Number(fin.profit || 0),
          }
        }),
      )
    },
    enabled: projects.length > 0,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  const tasksDone = useMemo(
    () => Number(taskStatusData.find((item) => String(item.name).toUpperCase() === "DONE")?.value ?? 0),
    [taskStatusData],
  )

  const openTasks = useMemo(
    () => taskStatusData.reduce((sum, item) => sum + Number(item.value || 0), 0) - tasksDone,
    [taskStatusData, tasksDone],
  )

  const hoursLogged = useMemo(
    () => (timesheets as any[]).reduce((sum, timesheet) => sum + (Number(timesheet.durationHours) || 0), 0),
    [timesheets],
  )

  const billablePct = useMemo(() => {
    const rows = timesheets as any[]
    if (!rows.length) return "--"
    const hasBillable = rows.some((row) => "billable" in row || "isBillable" in row)
    if (!hasBillable) return "--"
    const billableCount = rows.filter((row) => (row.billable ?? row.isBillable) === true).length
    return `${((billableCount / rows.length) * 100).toFixed(0)}%`
  }, [timesheets])

  const utilizationData = useMemo(() => {
    const byMonth = new Map<string, number>()
    ;(timesheets as any[]).forEach((timesheet) => {
      const date = new Date(timesheet.workDate ?? timesheet.date ?? timesheet.createdAt ?? Date.now())
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      byMonth.set(key, (byMonth.get(key) ?? 0) + (Number(timesheet.durationHours) || 0))
    })

    const lastSix = Array.from(byMonth.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-6)
    const max = Math.max(1, ...lastSix.map(([, value]) => value))
    return lastSix.map(([month, value]) => ({
      month,
      utilization: Math.round((value / max) * 100),
      hours: Number(value.toFixed(1)),
    }))
  }, [timesheets])

  const totalRevenue = useMemo(
    () => projectFinanceData.reduce((sum, project) => sum + Number(project.revenue || 0), 0),
    [projectFinanceData],
  )

  const totalCost = useMemo(
    () => projectFinanceData.reduce((sum, project) => sum + Number(project.cost || 0), 0),
    [projectFinanceData],
  )

  const kpis: KPI[] = [
    {
      label: "Total projects",
      value: projects.length,
      note: "Across active workspace",
      icon: Briefcase,
      tone: { card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" },
    },
    {
      label: "Tasks completed",
      value: tasksDone,
      note: `${Math.max(0, openTasks)} still open`,
      icon: CheckCircle2,
      tone: { card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" },
    },
    {
      label: "Hours logged",
      value: Number(hoursLogged.toFixed(1)),
      note: "From timesheet records",
      icon: Clock3,
      tone: { card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" },
    },
    {
      label: "Billable rate",
      value: billablePct,
      note: "Based on available flags",
      icon: Percent,
      tone: { card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" },
    },
  ]

  const isLoading = loadingProjects || loadingTs || loadingTasks || (projects.length > 0 && loadingFin)
  const firstError = errProjects || errTs || errTasks || errFin

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-72 opacity-35 md:block">
            <svg viewBox="0 0 288 128" fill="none" className="h-full w-full">
              <rect x="28" y="78" width="44" height="32" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="92" y="52" width="44" height="58" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="156" y="30" width="44" height="80" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M50 66C86 30 129 24 180 18C208 15 228 22 248 38" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="50" cy="66" r="5" fill="#bfdbfe" />
              <circle cx="180" cy="18" r="5" fill="#93c5fd" />
              <circle cx="248" cy="38" r="5" fill="#bfdbfe" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Reports
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Workspace reports
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Review project delivery, task completion, utilization, and project financial trends in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">Auto refresh on</span>
                <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">Live analytics</span>
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">15s sync</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <div className="rounded-lg border border-white/15 bg-white/10 p-3">
                <div className="text-[11px] text-white/62">Tracked revenue</div>
                <div className="mt-1 text-xl font-semibold text-white">{money(totalRevenue)}</div>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-3">
                <div className="text-[11px] text-white/62">Tracked cost</div>
                <div className="mt-1 text-xl font-semibold text-white">{money(totalCost)}</div>
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-xl border border-[#d8e3f2] bg-white p-10 text-center text-sm text-[#64748b] shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            Loading reports...
          </div>
        ) : firstError ? (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-10 text-center text-sm font-medium text-[#b91c1c] shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            {(firstError as Error).message || "Failed to load reports"}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <ChartPanel title="Task status distribution" description="Current task load grouped by status.">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={64} outerRadius={104} paddingAngle={3} dataKey="value">
                      {taskStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [Number(value).toLocaleString(), "Tasks"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Project cost vs revenue" description="Financial comparison for the latest visible projects.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectFinanceData} margin={{ top: 8, right: 8, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [money(Number(value)), ""]} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="cost" name="Cost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Resource utilization trend" description="Monthly timesheet hours normalized to a utilization score." wide>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={utilizationData} margin={{ top: 8, right: 18, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any, name: any) => (name === "hours" ? [value, "Hours"] : [`${value}%`, "Utilization"])} />
                    <Legend />
                    <Line type="monotone" dataKey="utilization" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} name="Utilization %" />
                    <Line type="monotone" dataKey="hours" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} name="Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1fr_0.7fr]">
              <div className="rounded-xl border border-[#d8e3f2] bg-white p-5 shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748b]">Portfolio</div>
                    <h2 className="mt-1 text-lg font-semibold text-[#0f172a]">Project financial summary</h2>
                  </div>
                  <FileText className="h-5 w-5 text-[#1a3c6e]" />
                </div>
                <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-[#f8fafc] text-xs uppercase tracking-[0.06em] text-[#64748b]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Project</th>
                        <th className="px-4 py-3 font-medium">Revenue</th>
                        <th className="px-4 py-3 font-medium">Cost</th>
                        <th className="px-4 py-3 font-medium">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] bg-white">
                      {projectFinanceData.map((project) => (
                        <tr key={project.name}>
                          <td className="px-4 py-3 font-medium text-[#0f172a]">{project.name}</td>
                          <td className="px-4 py-3 text-[#1a3c6e]">{money(project.revenue)}</td>
                          <td className="px-4 py-3 text-[#7c2d12]">{money(project.cost)}</td>
                          <td className={`px-4 py-3 font-medium ${project.profit >= 0 ? "text-[#15803d]" : "text-[#b91c1c]"}`}>{money(project.profit)}</td>
                        </tr>
                      ))}
                      {!projectFinanceData.length && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[#64748b]">
                            No financial records available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-[#d8e3f2] bg-white p-5 shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748b]">Insight</div>
                    <h2 className="mt-1 text-lg font-semibold text-[#0f172a]">Report health</h2>
                  </div>
                  <TrendingUp className="h-5 w-5 text-[#15803d]" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-[#eff6ff] p-4">
                    <div className="text-xs text-[#64748b]">Completion signal</div>
                    <div className="mt-1 text-xl font-semibold text-[#0f2a52]">{tasksDone} completed tasks</div>
                  </div>
                  <div className="rounded-lg bg-[#f0fdf4] p-4">
                    <div className="text-xs text-[#64748b]">Revenue coverage</div>
                    <div className="mt-1 text-xl font-semibold text-[#14532d]">{money(totalRevenue)}</div>
                  </div>
                  <div className="rounded-lg bg-[#fff7ed] p-4">
                    <div className="text-xs text-[#64748b]">Delivery effort</div>
                    <div className="mt-1 text-xl font-semibold text-[#7c2d12]">{Number(hoursLogged.toFixed(1))} hours</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

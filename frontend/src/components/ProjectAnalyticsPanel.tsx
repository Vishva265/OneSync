"use client"

import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as RPTooltip, Legend,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line
} from "recharts"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { tasksApi } from "@/api/tasks"
import { timesheetsApi } from "@/api/timesheets"
import { projectsApi } from "@/api/projects"

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#F97316", "#8B5CF6", "#0F172A"] // tuned to OneFlow palette

type Props = {
  projectId: string
  project?: { id: string; budgetAmount?: number | null; currency?: string | null }
}

export function ProjectAnalyticsPanel({ projectId, project }: Props) {
  // Tasks for this project
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => (await tasksApi.getByProject(projectId)).data,
  })

  // Timesheets for this project
  const { data: timesheets = [], isLoading: loadingTs } = useQuery({
    queryKey: ["timesheets-project", projectId],
    queryFn: async () => (await timesheetsApi.getAll({ project: projectId })).data,
  })

  // Financials for this project
  const { data: financials, isLoading: loadingFin } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: async () => (await projectsApi.getFinancials(projectId)).data,
  })

  // ------- KPIs -------
  const kpis = useMemo(() => {
    const toNum = (v: any) => (isFinite(Number(v)) ? Number(v) : 0)

    const totalTasks = (tasks as any[]).length
    const doneTasks = (tasks as any[]).filter(t => String(t.state).toUpperCase() === "DONE").length

    const estTotal = (tasks as any[]).reduce((s, t) => s + toNum(t.estimateHours), 0)
    const estDone = (tasks as any[]).filter(t => String(t.state).toUpperCase() === "DONE")
      .reduce((s, t) => s + toNum(t.estimateHours), 0)

    const loggedHours = (timesheets as any[]).reduce((s, t) => s + toNum(t.durationHours), 0)

    const revenue = toNum(financials?.revenue || 0)
    const cost = toNum(financials?.cost || 0)
    const profit = toNum(financials?.profit || revenue - cost)
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    const budget = toNum(project?.budgetAmount ?? 0)
    const budgetUsagePct = budget > 0 ? Math.min(100, Math.round((cost / budget) * 100)) : 0

    return {
      totalTasks, doneTasks,
      estTotal, estDone,
      loggedHours,
      revenue, cost, profit, margin,
      budget, budgetUsagePct,
    }
  }, [tasks, timesheets, financials, project?.budgetAmount])

  // ------- Task status pie -------
  const taskStatusData = useMemo(() => {
    const counts: Record<string, number> = {}
    ;(tasks as any[]).forEach(t => {
      const s = (t.state || "NEW").toString().toUpperCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  // ------- Hours by user (bar) -------
  const hoursByUser = useMemo(() => {
    const map = new Map<string, number>()
    ;(timesheets as any[]).forEach((t: any) => {
      const key = t.user?.fullName || t.user?.email || "Unknown"
      const v = isFinite(Number(t.durationHours)) ? Number(t.durationHours) : 0
      map.set(key, (map.get(key) || 0) + v)
    })
    return Array.from(map.entries()).map(([name, hours]) => ({ name, hours }))
  }, [timesheets])

  // ------- Burndown -------
  const burndownData = useMemo(() => {
    const toNum = (v: any) => (isFinite(Number(v)) ? Number(v) : 0)
    const dateKey = (d: string) => (d ? d.slice(0, 10) : "Unknown")

    const perDay = new Map<string, number>()
    ;(timesheets as any[]).forEach((t: any) => {
      const k = dateKey(t.workDate || t.createdAt || "")
      perDay.set(k, (perDay.get(k) || 0) + toNum(t.durationHours))
    })

    const days = Array.from(perDay.entries()).sort((a, b) => a[0].localeCompare(b[0]))

    let acc = 0
    const estTotal = (tasks as any[]).reduce((s, t) => s + toNum(t.estimateHours), 0)

    const rows = days.map(([day, h]) => {
      acc += h
      return { day, logged: acc, estimateTotal: estTotal }
    })

    if (rows.length === 0) {
      return [{ day: new Date().toISOString().slice(0, 10), logged: 0, estimateTotal: estTotal }]
    }
    return rows
  }, [timesheets, tasks])

  const loading = loadingTasks || loadingTs || loadingFin
  const fmtMoney = (n: number) =>
    (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: (project?.currency as any) || "USD", maximumFractionDigits: 0 })

  return (
    <div className="min-h-[200px] space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpis.doneTasks}/{kpis.totalTasks}</div>
            <div className="text-xs text-gray-500">Done / Total</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Est. Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpis.estDone}/{kpis.estTotal}</div>
            <div className="text-xs text-gray-500">Completed / Total</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Logged Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpis.loggedHours}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(kpis.profit/1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500">{kpis.margin.toFixed(1)}% margin</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpis.budget ? `${kpis.budgetUsagePct}%` : "—"}</div>
            {kpis.budget ? (
              <div className="text-xs text-gray-500">of {fmtMoney(kpis.budget)}</div>
            ) : (
              <div className="text-xs text-gray-400">No budget</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Status */}
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm text-gray-900">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(d: any) => `${d.name} (${d.value})`}
                  >
                    {taskStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RPTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hours by user */}
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm text-gray-900">Hours Logged by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByUser}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RPTooltip />
                  <Legend />
                  <Bar dataKey="hours" name="Hours" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Burndown */}
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm text-gray-900">Burndown (Logged vs Estimate)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RPTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="logged" name="Logged (cum.)" stroke="#10B981" dot={false} />
                  <Line type="monotone" dataKey="estimateTotal" name="Estimate (total)" stroke="#F97316" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-xs text-gray-400">Loading analytics…</p>}
    </div>
  )
}

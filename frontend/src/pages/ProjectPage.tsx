"use client"

import { useMemo, type ReactNode } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  FolderKanban,
  Gauge,
  Receipt,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"
import { projectsApi } from "@/api/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskBoard } from "@/components/TaskBoard"
import { TimesheetList } from "@/components/TimesheetList"
import { FinancePanel } from "@/components/FinancePanel"
import MilestonesPanel from "@/components/MilestonesPanel"
import { PurchaseOrdersPanel } from "@/components/PurchaseOrdersPanel"
import { VendorBillsPanel } from "@/components/VendorBillsPanel"
import { SalesOrderPanel } from "@/components/SalesOrderPanel"
import { ProjectAnalyticsPanel } from "@/components/ProjectAnalyticsPanel"
import type { Project, User } from "@/types"

const statusStyles: Record<Project["status"], { label: string; badge: string; dot: string }> = {
  PLANNING: {
    label: "Planning",
    badge: "bg-[#dbeafe] text-[#1d4ed8]",
    dot: "bg-[#2563eb]",
  },
  ACTIVE: {
    label: "Active",
    badge: "bg-[#dcfce7] text-[#15803d]",
    dot: "bg-[#16a34a]",
  },
  ON_HOLD: {
    label: "On hold",
    badge: "bg-[#fef9c3] text-[#854d0e]",
    dot: "bg-[#f59e0b]",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-[#dbeafe] text-[#1d4ed8]",
    dot: "bg-[#2563eb]",
  },
  ARCHIVED: {
    label: "Archived",
    badge: "bg-[#f3f4f6] text-[#374151]",
    dot: "bg-[#64748b]",
  },
}

function asNumber(value: unknown) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function money(value?: number | string | null, currency = "USD") {
  const amount = asNumber(value)
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }
}

function compactMoney(value?: number | string | null, currency = "USD") {
  const amount = asNumber(value)
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return `$${(amount / 1000).toFixed(1)}K`
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Not set"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not set"
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function initials(name?: string | null) {
  const parts = (name || "User").trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "U"
}

function normalizeTeamMembers(teamMembers?: Project["teamMembers"]) {
  return ((teamMembers || []) as Array<User | { user?: User }>)
    .map((member) => ("user" in member ? member.user : member))
    .filter(Boolean) as User[]
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748b]">{children}</div>
}

function ProgressBar({ value, tone = "bg-[#2563eb]" }: { value: number; tone?: string }) {
  const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${safeValue}%` }} />
    </div>
  )
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
  valueClassName = "text-[#0f172a]",
  children,
}: {
  label: string
  value: string | number
  note: string
  icon: LucideIcon
  accent: string
  valueClassName?: string
  children?: ReactNode
}) {
  return (
    <Card className="overflow-hidden rounded-xl border-[#e2e8f0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className={`h-1 ${accent}`} />
      <CardContent className="p-[18px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs text-[#64748b]">{label}</div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8fafc] text-[#1a3c6e]">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className={`text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] ${valueClassName}`}>
          {value}
        </div>
        <div className="mt-1 text-[11px] text-[#64748b]">{note}</div>
        {children ? <div className="mt-3">{children}</div> : null}
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f1f5f9] py-3 last:border-b-0">
      <span className="text-sm text-[#64748b]">{label}</span>
      <span className={`text-right text-sm font-medium ${tone || "text-[#0f172a]"}`}>{value}</span>
    </div>
  )
}

function PanelShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h3 className="mt-1 text-xl font-semibold leading-[1.3] text-[#0f172a]">{title}</h3>
      </div>
      <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">{children}</div>
    </div>
  )
}

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => (await projectsApi.getById(projectId!)).data,
    enabled: Boolean(projectId),
  })

  const { data: financials } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: async () => (await projectsApi.getFinancials(projectId!)).data,
    enabled: Boolean(projectId),
  })

  const progress = useMemo(() => {
    const tasks = (project?.tasks ?? []) as Array<{
      estimateHours?: number | null
      state?: string | null
    }>

    const totalTaskHours = tasks.reduce((sum, task) => sum + asNumber(task.estimateHours), 0)
    const completedHours = tasks
      .filter((task) => (task.state || "").toUpperCase() === "DONE")
      .reduce((sum, task) => sum + asNumber(task.estimateHours), 0)
    const doneTasks = tasks.filter((task) => (task.state || "").toUpperCase() === "DONE").length
    const taskPct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0
    const hourPct = totalTaskHours > 0 ? Math.round((completedHours / totalTaskHours) * 100) : taskPct

    return {
      pct: Math.min(100, hourPct),
      completedHours,
      totalTaskHours,
      doneTasks,
      totalTasks: tasks.length,
    }
  }, [project?.tasks])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f4fa] px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-8 text-sm text-[#64748b] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          Loading project...
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#f0f4fa] px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-8 text-sm font-medium text-[#b91c1c]">
          {error instanceof Error ? error.message : "Project not found"}
        </div>
      </div>
    )
  }

  const status = statusStyles[project.status] || statusStyles.PLANNING
  const teamMembers = normalizeTeamMembers(project.teamMembers)
  const currency = financials?.currency || project.currency || "USD"
  const recognizedRevenue = asNumber(financials?.revenue)
  const salesOrderTotal = asNumber(financials?.salesOrderTotal)
  const expectedRevenue = asNumber(financials?.expectedRevenue ?? Math.max(recognizedRevenue, salesOrderTotal))
  const cost = asNumber(financials?.cost)
  const profit = asNumber(financials?.expectedProfit ?? financials?.profit ?? expectedRevenue - cost)
  const recognizedProfit = asNumber(financials?.recognizedProfit ?? recognizedRevenue - cost)
  const budgetAmount = asNumber(financials?.budgetAmount || project.budgetAmount)
  const budgetUsed = budgetAmount > 0 ? Math.min(100, asNumber(financials?.budgetUsed || (cost / budgetAmount) * 100)) : 0
  const budgetRemaining = budgetAmount > 0 ? Math.max(0, budgetAmount - cost) : asNumber(financials?.budgetRemaining)
  const margin = asNumber(
    financials?.expectedProfitMargin ?? financials?.profitMargin ?? (expectedRevenue > 0 ? (profit / expectedRevenue) * 100 : 0),
  )
  const profitBasisLabel = expectedRevenue > recognizedRevenue ? "contract value" : "recognized revenue"

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="rounded-xl border border-[#d8e3f2] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Link
                to="/projects"
                className="mb-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#64748b] transition hover:border-[#1a3c6e] hover:text-[#1a3c6e] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to projects
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded bg-[#eff6ff] px-2 py-1 text-[11px] font-medium text-[#1a3c6e]">
                  {project.code}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-[10px] py-[3px] text-[11px] font-medium ${status.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              <h1 className="mt-3 max-w-4xl text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0f172a]">
                {project.name}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-[1.6] text-[#64748b]">
                {project.description || "This project does not have a description yet."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[560px]">
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <Users className="h-4 w-4 text-[#1a3c6e]" />
                  Manager
                </div>
                <div className="mt-2 truncate text-sm font-medium text-[#0f172a]">
                  {project.projectManager?.fullName || "Unassigned"}
                </div>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <CalendarDays className="h-4 w-4 text-[#1a3c6e]" />
                  Timeline
                </div>
                <div className="mt-2 truncate text-sm font-medium text-[#0f172a]">
                  {formatDate(project.startDate)}
                </div>
                <div className="mt-1 text-[11px] text-[#64748b]">Due {formatDate(project.endDate)}</div>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <BriefcaseBusiness className="h-4 w-4 text-[#1a3c6e]" />
                  Budget
                </div>
                <div className="mt-2 text-sm font-medium text-[#0f172a]">{money(budgetAmount, currency)}</div>
                <div className="mt-1 text-[11px] text-[#64748b]">{teamMembers.length} team members</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Project progress"
            value={`${progress.pct}%`}
            note={`${progress.completedHours}h of ${progress.totalTaskHours}h completed`}
            icon={Gauge}
            accent="bg-[#2563eb]"
          >
            <ProgressBar value={progress.pct} />
          </MetricCard>
          <MetricCard
            label={expectedRevenue > recognizedRevenue ? "Contract value" : "Revenue"}
            value={compactMoney(expectedRevenue, currency)}
            note={`Recognized ${money(recognizedRevenue, currency)} from ${financials?.counts?.invoices || 0} invoices`}
            icon={CircleDollarSign}
            accent="bg-[#16a34a]"
            valueClassName="text-[#15803d]"
          />
          <MetricCard
            label="Cost"
            value={compactMoney(cost, currency)}
            note="Labor, expenses, and vendors"
            icon={Receipt}
            accent="bg-[#f59e0b]"
          />
          <MetricCard
            label="Projected profit"
            value={compactMoney(profit, currency)}
            note={`${margin.toFixed(1)}% margin on ${profitBasisLabel}`}
            icon={TrendingUp}
            accent={profit < 0 ? "bg-[#dc2626]" : "bg-[#16a34a]"}
            valueClassName={profit < 0 ? "text-[#b91c1c]" : "text-[#15803d]"}
          />
          <MetricCard
            label="Milestones"
            value={`${financials?.milestones?.done || 0}/${financials?.milestones?.total || 0}`}
            note={`${financials?.milestones?.invoiced || 0} invoiced`}
            icon={CheckCircle2}
            accent="bg-[#1a3c6e]"
          />
        </section>

        <Tabs className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" defaultValue="overview">
          <div className="border-b border-[#e2e8f0] p-3">
            <TabsList className="flex flex-wrap gap-2 border-0 bg-transparent p-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="sales-orders">Sales orders</TabsTrigger>
              <TabsTrigger value="purchase-orders">Purchase orders</TabsTrigger>
              <TabsTrigger value="vendor-bills">Vendor bills</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-5 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card className="rounded-xl border-[#e2e8f0] bg-white shadow-none">
                <CardHeader className="border-b border-[#f1f5f9] p-5 pb-4">
                  <SectionLabel>Financials</SectionLabel>
                  <CardTitle className="mt-1 text-xl font-semibold leading-[1.3] text-[#0f172a]">
                    Financial breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <DetailRow label="Contract value" value={money(expectedRevenue, currency)} tone="text-[#15803d]" />
                  <DetailRow label="Recognized revenue" value={money(recognizedRevenue, currency)} tone="text-[#1d4ed8]" />
                  <DetailRow label="Timesheet cost" value={money(financials?.timesheetCost, currency)} />
                  <DetailRow label="Expense cost" value={money(financials?.expenseCost, currency)} />
                  <DetailRow label="Vendor bills" value={money(financials?.vendorBillCost, currency)} />
                  <DetailRow label="Total cost" value={money(cost, currency)} tone="text-[#0f172a]" />
                  <DetailRow
                    label="Projected profit"
                    value={money(profit, currency)}
                    tone={profit < 0 ? "text-[#b91c1c]" : "text-[#15803d]"}
                  />
                  <DetailRow
                    label="Recognized profit"
                    value={recognizedRevenue > 0 ? money(recognizedProfit, currency) : "Not invoiced yet"}
                    tone={recognizedRevenue > 0 && recognizedProfit < 0 ? "text-[#b91c1c]" : "text-[#64748b]"}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-xl border-[#e2e8f0] bg-white shadow-none">
                <CardHeader className="border-b border-[#f1f5f9] p-5 pb-4">
                  <SectionLabel>Budget</SectionLabel>
                  <CardTitle className="mt-1 text-xl font-semibold leading-[1.3] text-[#0f172a]">
                    Budget status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="mb-4 rounded-xl bg-[#f8fafc] p-4">
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-[#0f172a]">Budget used</span>
                      <span className="text-[#64748b]">{budgetUsed.toFixed(1)}%</span>
                    </div>
                    <ProgressBar value={budgetUsed} tone={budgetUsed > 100 ? "bg-[#dc2626]" : "bg-[#2563eb]"} />
                  </div>
                  <DetailRow label="Budget" value={money(budgetAmount, currency)} />
                  <DetailRow label="Used" value={money(cost, currency)} />
                  <DetailRow label="Remaining" value={money(budgetRemaining, currency)} tone="text-[#15803d]" />
                  <DetailRow label="Purchase orders" value={money(financials?.purchaseOrderTotal, currency)} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-xl border-[#e2e8f0] bg-white shadow-none">
                <CardHeader className="border-b border-[#f1f5f9] p-5 pb-4">
                  <SectionLabel>Team</SectionLabel>
                  <CardTitle className="mt-1 text-xl font-semibold leading-[1.3] text-[#0f172a]">
                    Ownership and staffing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-medium text-[#1a3c6e]">
                        {initials(project.projectManager?.fullName)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#0f172a]">
                          {project.projectManager?.fullName || "Unassigned"}
                        </div>
                        <div className="text-xs text-[#64748b]">Project manager</div>
                      </div>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                      {teamMembers.length} team members
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {teamMembers.length ? (
                      teamMembers.slice(0, 6).map((member) => (
                        <div key={member.id} className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-[#1a3c6e]">
                            {initials(member.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[#0f172a]">{member.fullName}</div>
                            <div className="truncate text-xs text-[#64748b]">{member.email}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#d1d5db] bg-[#f8fafc] p-4 text-sm text-[#64748b] sm:col-span-2 lg:col-span-3">
                        No team members have been assigned yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-[#e2e8f0] bg-white shadow-none">
                <CardHeader className="border-b border-[#f1f5f9] p-5 pb-4">
                  <SectionLabel>Delivery</SectionLabel>
                  <CardTitle className="mt-1 text-xl font-semibold leading-[1.3] text-[#0f172a]">
                    Execution snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#f8fafc] p-4">
                      <div className="flex items-center gap-2 text-xs text-[#64748b]">
                        <FolderKanban className="h-4 w-4 text-[#1a3c6e]" />
                        Tasks
                      </div>
                      <div className="mt-2 text-[26px] font-semibold leading-[1.3] text-[#0f172a]">
                        {progress.doneTasks}/{progress.totalTasks}
                      </div>
                      <div className="mt-1 text-[11px] text-[#64748b]">Done tasks</div>
                    </div>
                    <div className="rounded-lg bg-[#f8fafc] p-4">
                      <div className="flex items-center gap-2 text-xs text-[#64748b]">
                        <Clock3 className="h-4 w-4 text-[#1a3c6e]" />
                        Timesheets
                      </div>
                      <div className="mt-2 text-[26px] font-semibold leading-[1.3] text-[#0f172a]">
                        {financials?.counts?.timesheets || 0}
                      </div>
                      <div className="mt-1 text-[11px] text-[#64748b]">Approved entries counted</div>
                    </div>
                    <div className="rounded-lg bg-[#f8fafc] p-4">
                      <div className="flex items-center gap-2 text-xs text-[#64748b]">
                        <Receipt className="h-4 w-4 text-[#1a3c6e]" />
                        Expenses
                      </div>
                      <div className="mt-2 text-[26px] font-semibold leading-[1.3] text-[#0f172a]">
                        {financials?.counts?.expenses || 0}
                      </div>
                      <div className="mt-1 text-[11px] text-[#64748b]">Approved expenses</div>
                    </div>
                    <div className="rounded-lg bg-[#f8fafc] p-4">
                      <div className="flex items-center gap-2 text-xs text-[#64748b]">
                        <FileText className="h-4 w-4 text-[#1a3c6e]" />
                        Documents
                      </div>
                      <div className="mt-2 text-[26px] font-semibold leading-[1.3] text-[#0f172a]">
                        {(financials?.counts?.salesOrders || 0) + (financials?.counts?.purchaseOrders || 0)}
                      </div>
                      <div className="mt-1 text-[11px] text-[#64748b]">SO + PO records</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="p-4 sm:p-5">
            <PanelShell eyebrow="Delivery billing" title="Milestones">
              <MilestonesPanel
                projectId={projectId!}
                onRefresh={() => {
                  queryClient.invalidateQueries({ queryKey: ["project-financials", projectId] })
                  queryClient.invalidateQueries({ queryKey: ["project", projectId] })
                }}
              />
            </PanelShell>
          </TabsContent>

          <TabsContent value="tasks" className="p-4 sm:p-5">
            <PanelShell eyebrow="Execution" title="Task board">
              <TaskBoard projectId={projectId!} teamMembers={project.teamMembers} />
            </PanelShell>
          </TabsContent>

          <TabsContent value="timesheets" className="p-4 sm:p-5">
            <PanelShell eyebrow="Work logs" title="Timesheets">
              <TimesheetList projectId={projectId!} />
            </PanelShell>
          </TabsContent>

          <TabsContent value="finance" className="p-4 sm:p-5">
            <PanelShell eyebrow="Billing" title="Finance actions">
              <FinancePanel projectId={projectId!} />
            </PanelShell>
          </TabsContent>

          <TabsContent value="sales-orders" className="p-4 sm:p-5">
            <PanelShell eyebrow="Revenue documents" title="Sales orders">
              <SalesOrderPanel projectId={projectId!} />
            </PanelShell>
          </TabsContent>

          <TabsContent value="purchase-orders" className="p-4 sm:p-5">
            <PanelShell eyebrow="Procurement" title="Purchase orders">
              <PurchaseOrdersPanel projectId={projectId!} />
            </PanelShell>
          </TabsContent>

          <TabsContent value="vendor-bills" className="p-4 sm:p-5">
            <PanelShell eyebrow="Payables" title="Vendor bills">
              <VendorBillsPanel projectId={projectId!} />
            </PanelShell>
          </TabsContent>

          <TabsContent value="analytics" className="p-4 sm:p-5">
            <PanelShell eyebrow="Insights" title="Project analytics">
              <ProjectAnalyticsPanel projectId={projectId!} project={project} />
            </PanelShell>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

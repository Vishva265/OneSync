import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { projectsApi } from "@/api/projects"
import type { Project, ProjectFinancials } from "@/types"
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Receipt,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

type TabKey = "overview" | "costs" | "milestones" | "budget"

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "costs", label: "Costs" },
  { key: "milestones", label: "Milestones" },
  { key: "budget", label: "Budget" },
]

const money = (value: any) => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

function pct(value: number) {
  return `${Number(value || 0).toFixed(1)}%`
}

function healthInfo(financials: ProjectFinancials) {
  if (financials.budgetUsed > 90) {
    return {
      label: "Critical",
      icon: AlertCircle,
      badge: "bg-[#fee2e2] text-[#b91c1c]",
      bar: "bg-[#dc2626]",
      note: "Budget almost exhausted",
    }
  }
  if (financials.budgetUsed > 75) {
    return {
      label: "Warning",
      icon: AlertCircle,
      badge: "bg-[#fef9c3] text-[#854d0e]",
      bar: "bg-[#f59e0b]",
      note: "Approaching budget limit",
    }
  }
  return {
    label: "Healthy",
    icon: CheckCircle2,
    badge: "bg-[#dcfce7] text-[#15803d]",
    bar: "bg-[#16a34a]",
    note: "Within budget",
  }
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
  icon: typeof DollarSign
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

function CountCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1a3c6e] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[26px] font-semibold leading-[1.3] text-[#0f172a]">{value}</div>
      <div className="mt-1 text-xs text-[#64748b]">{label}</div>
    </div>
  )
}

function ProgressRow({
  label,
  value,
  amount,
  color,
}: {
  label: string
  value: number
  amount: string
  color: string
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-4 text-sm">
        <span className="font-medium text-[#0f172a]">{label}</span>
        <span className="text-[#64748b]">{amount}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#e2e8f0]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(3, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

export default function FinancialDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("overview")

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) fetchFinancials(selectedProject)
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
      if (response.data.length > 0) setSelectedProject(response.data[0].id)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchFinancials = async (projectId: string) => {
    setLoading(true)
    try {
      const response = await projectsApi.getFinancials(projectId)
      setFinancials(response.data)
    } catch (error) {
      console.error("Failed to fetch financials:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProjectData = projects.find((project) => project.id === selectedProject)
  const health = financials ? healthInfo(financials) : null
  const costShare = useMemo(() => {
    if (!financials || financials.cost <= 0) return { timesheet: 0, expense: 0, vendor: 0 }
    return {
      timesheet: (financials.timesheetCost / financials.cost) * 100,
      expense: (financials.expenseCost / financials.cost) * 100,
      vendor: (financials.vendorBillCost / financials.cost) * 100,
    }
  }, [financials])

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-64 opacity-35 md:block">
            <svg viewBox="0 0 256 128" fill="none" className="h-full w-full">
              <rect x="28" y="64" width="82" height="46" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="144" y="20" width="82" height="54" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M70 64C98 30 130 18 176 24" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="70" cy="64" r="5" fill="#bfdbfe" />
              <circle cx="176" cy="24" r="5" fill="#93c5fd" />
              <path d="M48 88H90" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M162 40H204" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M162 54H192" stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Financials
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Financial dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Track revenue, project cost, budget health, milestones, invoices, and vendor activity.
              </p>
              {financials && health && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${health.badge}`}>{health.label}</span>
                  <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                    {selectedProjectData?.code || financials.projectCode}
                  </span>
                  <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">
                    {pct(financials.profitMargin)} margin
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                className="h-10 min-w-64 rounded-lg border border-white/20 bg-white px-3 text-sm text-[#0f172a] outline-none"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <Link
                  to={`/projects/${selectedProject}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa]"
                >
                  View project
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-xl border border-[#d8e3f2] bg-white p-10 text-center text-sm text-[#64748b] shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            Loading financial data...
          </div>
        ) : !financials ? (
          <div className="rounded-xl border border-[#d8e3f2] bg-white p-10 text-center text-sm text-[#64748b] shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            Select a project to view financials.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Total revenue"
                value={money(financials.revenue)}
                note={`${financials.counts.invoices} invoices`}
                icon={DollarSign}
                tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
              />
              <KpiCard
                label="Total cost"
                value={money(financials.cost)}
                note="Timesheets, expenses, vendors"
                icon={Receipt}
                tone={{ card: "bg-[#fee2e2]", icon: "bg-white text-[#b91c1c]", value: "text-[#7f1d1d]", strip: "bg-[#dc2626]" }}
              />
              <KpiCard
                label="Net profit"
                value={money(financials.profit)}
                note={`${pct(financials.profitMargin)} margin`}
                icon={financials.profit >= 0 ? TrendingUp : TrendingDown}
                tone={{
                  card: financials.profit >= 0 ? "bg-[#f0fdf4]" : "bg-[#fee2e2]",
                  icon: financials.profit >= 0 ? "bg-white text-[#15803d]" : "bg-white text-[#b91c1c]",
                  value: financials.profit >= 0 ? "text-[#14532d]" : "text-[#7f1d1d]",
                  strip: financials.profit >= 0 ? "bg-[#16a34a]" : "bg-[#dc2626]",
                }}
              />
              <KpiCard
                label="Budget remaining"
                value={money(financials.budgetRemaining)}
                note={`${pct(100 - financials.budgetUsed)} left`}
                icon={Target}
                tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
              />
            </section>

            <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
              <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Project finance</div>
                    <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">{selectedProjectData?.name || financials.projectName}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#e2e8f0] p-1 sm:flex">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`h-9 rounded-md px-4 text-sm font-medium transition ${
                          activeTab === tab.key ? "bg-white text-[#1a3c6e] shadow-[0_1px_4px_rgba(0,0,0,0.06)]" : "text-[#64748b] hover:text-[#0f172a]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5">
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                        <h3 className="mb-5 text-base font-medium text-[#0f172a]">Revenue vs cost analysis</h3>
                        <div className="space-y-5">
                          <ProgressRow label="Revenue" amount={money(financials.revenue)} value={100} color="bg-[#2563eb]" />
                          <ProgressRow
                            label="Cost"
                            amount={money(financials.cost)}
                            value={financials.revenue > 0 ? (financials.cost / financials.revenue) * 100 : 0}
                            color="bg-[#dc2626]"
                          />
                          <ProgressRow
                            label="Profit"
                            amount={money(financials.profit)}
                            value={financials.revenue > 0 ? (financials.profit / financials.revenue) * 100 : 0}
                            color={financials.profit >= 0 ? "bg-[#16a34a]" : "bg-[#64748b]"}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                        <h3 className="mb-4 text-base font-medium text-[#0f172a]">Budget health</h3>
                        {health && (
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-[10px] py-[3px] text-[11px] font-medium">
                            <health.icon className="h-4 w-4" />
                            <span className={health.badge}>{health.note}</span>
                          </div>
                        )}
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-[#64748b]">Used</span>
                          <span className="font-medium text-[#0f172a]">{pct(financials.budgetUsed)}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#e2e8f0]">
                          <div className={`h-full rounded-full ${health?.bar || "bg-[#16a34a]"}`} style={{ width: `${Math.min(100, financials.budgetUsed)}%` }} />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-[#f8fafc] p-3">
                            <div className="text-[11px] text-[#94a3b8]">Budget</div>
                            <div className="text-sm font-medium text-[#0f172a]">{money(financials.budgetAmount)}</div>
                          </div>
                          <div className="rounded-lg bg-[#f8fafc] p-3">
                            <div className="text-[11px] text-[#94a3b8]">Used</div>
                            <div className="text-sm font-medium text-[#0f172a]">{money(financials.cost)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                      <CountCard label="Invoices" value={financials.counts.invoices} icon={FileText} />
                      <CountCard label="Timesheets" value={financials.counts.timesheets} icon={Clock} />
                      <CountCard label="Expenses" value={financials.counts.expenses} icon={Receipt} />
                      <CountCard label="Vendor bills" value={financials.counts.vendorBills} icon={ShoppingCart} />
                      <CountCard label="Sales orders" value={financials.counts.salesOrders} icon={Target} />
                      <CountCard label="Purchase orders" value={financials.counts.purchaseOrders} icon={ShoppingCart} />
                    </div>
                  </div>
                )}

                {activeTab === "costs" && (
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-3">
                      <KpiCard
                        label="Timesheet cost"
                        value={money(financials.timesheetCost)}
                        note="Labor hours"
                        icon={Clock}
                        tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
                      />
                      <KpiCard
                        label="Expense cost"
                        value={money(financials.expenseCost)}
                        note="Team expenses"
                        icon={Receipt}
                        tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
                      />
                      <KpiCard
                        label="Vendor bills"
                        value={money(financials.vendorBillCost)}
                        note="External vendors"
                        icon={ShoppingCart}
                        tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
                      />
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                      <h3 className="mb-5 text-base font-medium text-[#0f172a]">Cost distribution</h3>
                      <div className="space-y-5">
                        <ProgressRow label="Timesheet cost" amount={`${money(financials.timesheetCost)} (${pct(costShare.timesheet)})`} value={costShare.timesheet} color="bg-[#2563eb]" />
                        <ProgressRow label="Expense cost" amount={`${money(financials.expenseCost)} (${pct(costShare.expense)})`} value={costShare.expense} color="bg-[#a855f7]" />
                        <ProgressRow label="Vendor bills" amount={`${money(financials.vendorBillCost)} (${pct(costShare.vendor)})`} value={costShare.vendor} color="bg-[#f59e0b]" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "milestones" && (
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-4">
                      <KpiCard label="Total milestones" value={financials.milestones.total} note="All milestones" icon={Target} tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }} />
                      <KpiCard label="Completed" value={financials.milestones.done} note="Marked done" icon={CheckCircle2} tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }} />
                      <KpiCard label="Invoiced" value={financials.milestones.invoiced} note="Invoice created" icon={FileText} tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }} />
                      <KpiCard label="Pending" value={financials.milestones.total - financials.milestones.done} note="Not completed" icon={AlertCircle} tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }} />
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                      <h3 className="mb-5 text-base font-medium text-[#0f172a]">Milestone financial summary</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Total value</div>
                          <div className="mt-1 text-xl font-semibold text-[#0f172a]">{money(financials.milestones.totalAmount)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Invoiced amount</div>
                          <div className="mt-1 text-xl font-semibold text-[#15803d]">{money(financials.milestones.invoicedAmount)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Remaining</div>
                          <div className="mt-1 text-xl font-semibold text-[#1a3c6e]">
                            {money(financials.milestones.totalAmount - financials.milestones.invoicedAmount)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5">
                        <ProgressRow
                          label="Invoicing progress"
                          amount={`${financials.milestones.invoiced} / ${financials.milestones.total}`}
                          value={financials.milestones.totalAmount > 0 ? (financials.milestones.invoicedAmount / financials.milestones.totalAmount) * 100 : 0}
                          color="bg-[#16a34a]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "budget" && (
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-3">
                      <KpiCard label="Budget" value={money(financials.budgetAmount)} note="Total allocated" icon={Target} tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }} />
                      <KpiCard label="Used" value={money(financials.cost)} note={`${pct(financials.budgetUsed)} of budget`} icon={TrendingDown} tone={{ card: "bg-[#fee2e2]", icon: "bg-white text-[#b91c1c]", value: "text-[#7f1d1d]", strip: "bg-[#dc2626]" }} />
                      <KpiCard label="Remaining" value={money(financials.budgetRemaining)} note={`${pct(100 - financials.budgetUsed)} left`} icon={DollarSign} tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }} />
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                      <h3 className="mb-5 text-base font-medium text-[#0f172a]">Budget utilization</h3>
                      <ProgressRow label="Budget used" amount={`${money(financials.cost)} / ${money(financials.budgetAmount)}`} value={financials.budgetUsed} color={health?.bar || "bg-[#16a34a]"} />
                      <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Planned revenue</div>
                          <div className="mt-1 text-lg font-semibold text-[#0f172a]">{money(financials.salesOrderTotal)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Actual revenue</div>
                          <div className="mt-1 text-lg font-semibold text-[#0f172a]">{money(financials.revenue)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Total costs</div>
                          <div className="mt-1 text-lg font-semibold text-[#0f172a]">{money(financials.cost)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4">
                          <div className="text-xs text-[#64748b]">Expected profit</div>
                          <div className={`mt-1 text-lg font-semibold ${financials.profit >= 0 ? "text-[#15803d]" : "text-[#b91c1c]"}`}>
                            {money(financials.profit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

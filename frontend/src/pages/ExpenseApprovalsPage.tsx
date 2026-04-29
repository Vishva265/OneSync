import { useEffect, useMemo, useState } from "react"
import { expensesApi } from "@/api/expenses"
import { projectsApi } from "@/api/projects"
import type { Expense, Project } from "@/types"
import { AlertTriangle, CalendarDays, CheckCircle2, Filter, ReceiptText, WalletCards, XCircle } from "lucide-react"

const num = (value: any) => {
  const parsed = Number(value)
  return isFinite(parsed) ? parsed : 0
}

function formatMoney(currency: string | undefined, amount: any) {
  return `${currency || "INR"} ${num(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function formatDate(value: any) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = String(status || "SUBMITTED").toUpperCase()
  const classes =
    normalized === "APPROVED"
      ? "bg-[#dcfce7] text-[#15803d]"
      : normalized === "REJECTED"
        ? "bg-[#fee2e2] text-[#b91c1c]"
        : "bg-[#fef9c3] text-[#854d0e]"

  return <span className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${classes}`}>{normalized}</span>
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
  icon: typeof ReceiptText
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

export default function ExpenseApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
    fetchPendingExpenses()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchPendingExpenses = async (projectId?: string) => {
    setLoading(true)
    try {
      const response = await expensesApi.getPending(projectId)
      setExpenses(response.data)
    } catch (error) {
      console.error("Failed to fetch pending expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectFilter = (projectId: string) => {
    setSelectedProject(projectId)
    fetchPendingExpenses(projectId || undefined)
  }

  const handleApprove = async (expenseId: string) => {
    try {
      await expensesApi.approve(expenseId)
      fetchPendingExpenses(selectedProject || undefined)
    } catch (error) {
      console.error("Failed to approve expense:", error)
      alert("Failed to approve expense")
    }
  }

  const handleReject = async (expenseId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }
    try {
      await expensesApi.reject(expenseId, rejectReason)
      setRejectingId(null)
      setRejectReason("")
      fetchPendingExpenses(selectedProject || undefined)
    } catch (error) {
      console.error("Failed to reject expense:", error)
      alert("Failed to reject expense")
    }
  }

  const summary = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + num(expense.amount), 0)
    const billable = expenses.filter((expense) => expense.billable).length
    const withReceipts = expenses.filter((expense) => expense.receiptUrl).length
    return { totalAmount, billable, withReceipts, count: expenses.length }
  }, [expenses])

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-64 opacity-35 md:block">
            <svg viewBox="0 0 256 128" fill="none" className="h-full w-full">
              <rect x="26" y="62" width="84" height="48" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="146" y="20" width="82" height="52" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M70 62C98 28 132 16 176 22" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="70" cy="62" r="5" fill="#bfdbfe" />
              <circle cx="176" cy="22" r="5" fill="#93c5fd" />
              <path d="M49 86L59 96L86 72" stroke="rgba(255,255,255,0.74)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M166 42H204" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M166 56H194" stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Approvals
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Expense approval queue
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Review submitted expenses, validate receipts, and approve or reject claims for finance processing.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">
                  {summary.count} pending
                </span>
                <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                  {summary.withReceipts} receipts
                </span>
                <span className="rounded-full bg-[#fef9c3] px-[10px] py-[3px] text-[11px] font-medium text-[#854d0e]">
                  {summary.billable} billable
                </span>
              </div>
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <select
                value={selectedProject}
                onChange={(event) => handleProjectFilter(event.target.value)}
                className="h-10 min-w-64 rounded-lg border border-white/20 bg-white pl-9 pr-3 text-sm text-[#0f172a] outline-none"
              >
                <option value="">All projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Pending approval"
            value={summary.count}
            note="Submitted expenses"
            icon={AlertTriangle}
            tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
          />
          <KpiCard
            label="Total amount"
            value={formatMoney("INR", summary.totalAmount)}
            note="Awaiting review"
            icon={WalletCards}
            tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
          />
          <KpiCard
            label="Billable"
            value={summary.billable}
            note="Customer-chargeable"
            icon={ReceiptText}
            tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }}
          />
          <KpiCard
            label="With receipts"
            value={summary.withReceipts}
            note="Receipt link attached"
            icon={CheckCircle2}
            tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
          <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Review queue</div>
            <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">Pending expense claims</h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#64748b]">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-base font-medium text-[#0f172a]">No pending expenses to review</div>
              <p className="mt-2 text-sm text-[#64748b]">All expenses have been processed.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 xl:grid-cols-2">
              {expenses.map((expense) => (
                <article
                  key={expense.id}
                  className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_4px_16px_rgba(15,42,82,0.05)]"
                >
                  <div className="h-1 bg-[#f59e0b]" />
                  <div className="p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-medium text-[#0f172a]">{expense.category || "Uncategorized"}</h3>
                          <StatusBadge status={expense.status} />
                          {expense.billable && (
                            <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                              Billable
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-[#64748b]">{expense.notes || "No notes added"}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-[11px] text-[#94a3b8]">Amount</div>
                        <div className="text-[26px] font-semibold leading-[1.3] text-[#0f172a]">
                          {formatMoney(expense.currency, expense.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:grid-cols-2">
                      <div>
                        <div className="text-[11px] text-[#94a3b8]">Submitted by</div>
                        <div className="mt-1 text-sm font-medium text-[#0f172a]">{expense.user?.fullName || "Unknown"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#94a3b8]">Project</div>
                        <div className="mt-1 truncate text-sm font-medium text-[#0f172a]">{expense.project?.name || expense.projectId || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#94a3b8]">Expense date</div>
                        <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                          <CalendarDays className="h-4 w-4 text-[#64748b]" />
                          {formatDate(expense.date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#94a3b8]">Receipt</div>
                        {expense.receiptUrl ? (
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex text-sm font-medium text-[#1a3c6e] hover:underline"
                          >
                            View receipt
                          </a>
                        ) : (
                          <div className="mt-1 text-sm font-medium text-[#64748b]">Not attached</div>
                        )}
                      </div>
                    </div>

                    {rejectingId === expense.id && (
                      <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] p-4">
                        <label className="mb-1 block text-xs font-medium text-[#b91c1c]">Rejection reason</label>
                        <textarea
                          value={rejectReason}
                          onChange={(event) => setRejectReason(event.target.value)}
                          className="min-h-20 w-full rounded-lg border-[1.5px] border-[#fecaca] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#dc2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
                          placeholder="Explain why this expense is being rejected..."
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReject(expense.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#dc2626] px-4 text-sm font-medium text-white transition hover:bg-[#b91c1c]"
                          >
                            <XCircle className="h-4 w-4" />
                            Confirm reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null)
                              setRejectReason("")
                            }}
                            className="h-9 rounded-lg border border-[#fecaca] bg-white px-4 text-sm font-medium text-[#b91c1c] transition hover:bg-[#fff1f2]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {expense.status === "SUBMITTED" && rejectingId !== expense.id && (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleApprove(expense.id)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#16a34a] px-5 text-sm font-medium text-white transition hover:bg-[#15803d]"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(expense.id)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-[1.5px] border-[#dc2626] px-5 text-sm font-medium text-[#dc2626] transition hover:bg-[#fee2e2]"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

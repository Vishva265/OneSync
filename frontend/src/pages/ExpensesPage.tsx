import { useEffect, useMemo, useState } from "react"
import { expensesApi } from "@/api/expenses"
import { projectsApi } from "@/api/projects"
import { useAuthStore } from "@/store/auth"
import type { Expense, Project } from "@/types"
import { CalendarDays, FileText, Filter, Plus, ReceiptText, WalletCards } from "lucide-react"

const categories = ["Travel", "Meals", "Accommodation", "Software", "Office Supplies", "Other"]

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
  const normalized = String(status || "DRAFT").toUpperCase()
  const classes =
    normalized === "APPROVED"
      ? "bg-[#dcfce7] text-[#15803d]"
      : normalized === "SUBMITTED"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
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

export default function ExpensesPage() {
  const { user } = useAuthStore()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState<{ projectId?: string; status?: string }>({})
  const [formData, setFormData] = useState({
    projectId: "",
    amount: 0,
    currency: "INR",
    date: new Date().toISOString().split("T")[0],
    category: "",
    billable: false,
    notes: "",
    receiptUrl: "",
  })

  useEffect(() => {
    fetchProjects()
    fetchExpenses()
  }, [])

  useEffect(() => {
    fetchExpenses(filters)
  }, [filters.projectId, filters.status])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchExpenses = async (nextFilters: { projectId?: string; status?: string } = filters) => {
    setLoading(true)
    try {
      const response = await expensesApi.getAll(nextFilters)
      setExpenses(response.data)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      projectId: "",
      amount: 0,
      currency: "INR",
      date: new Date().toISOString().split("T")[0],
      category: "",
      billable: false,
      notes: "",
      receiptUrl: "",
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) {
      alert("User not logged in")
      return
    }

    try {
      await expensesApi.create({
        ...formData,
        userId: user.id,
        amount: num(formData.amount),
      })
      setShowForm(false)
      resetForm()
      fetchExpenses()
    } catch (error) {
      console.error("Failed to create expense:", error)
      alert("Failed to submit expense")
    }
  }

  const summary = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + num(expense.amount), 0)
    const pending = expenses.filter((expense) => expense.status === "SUBMITTED").length
    const approved = expenses.filter((expense) => expense.status === "APPROVED").length
    const billable = expenses.filter((expense) => expense.billable).length
    return { totalAmount, pending, approved, billable, count: expenses.length }
  }, [expenses])

  const clearFilters = () => setFilters({})

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-64 opacity-35 md:block">
            <svg viewBox="0 0 256 128" fill="none" className="h-full w-full">
              <rect x="28" y="54" width="84" height="52" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="150" y="22" width="72" height="62" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M72 54C100 28 130 20 164 28" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="72" cy="54" r="5" fill="#bfdbfe" />
              <circle cx="164" cy="28" r="5" fill="#93c5fd" />
              <path d="M50 80H90" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M50 93H80" stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeLinecap="round" />
              <path d="M168 48H204" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M168 62H194" stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Expenses
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Expense operations
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Submit project expenses, track approval status, and keep billable claims ready for finance review.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">
                  {summary.count} records
                </span>
                <span className="rounded-full bg-[#fef9c3] px-[10px] py-[3px] text-[11px] font-medium text-[#854d0e]">
                  {summary.pending} pending
                </span>
                <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">
                  {summary.approved} approved
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa]"
            >
              <Plus className="h-4 w-4" />
              {showForm ? "Close form" : "Submit expense"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total records"
            value={summary.count}
            note="Visible expenses"
            icon={ReceiptText}
            tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
          />
          <KpiCard
            label="Pending approval"
            value={summary.pending}
            note="Submitted claims"
            icon={FileText}
            tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
          />
          <KpiCard
            label="Approved"
            value={summary.approved}
            note="Ready for reimbursement"
            icon={WalletCards}
            tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }}
          />
          <KpiCard
            label="Total amount"
            value={formatMoney("INR", summary.totalAmount)}
            note={`${summary.billable} billable`}
            icon={ReceiptText}
            tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
          />
        </section>

        {showForm && (
          <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Submit</div>
              <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">New expense</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Project</label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(event) => setFormData({ ...formData, projectId: event.target.value })}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(event) => setFormData({ ...formData, amount: parseFloat(event.target.value) })}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#64748b]">Receipt URL</label>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(event) => setFormData({ ...formData, receiptUrl: event.target.value })}
                  className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  placeholder="https://storage.example.com/receipt.jpg"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#64748b]">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                  className="min-h-24 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  placeholder="Describe the expense purpose..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a]">
                  <input
                    type="checkbox"
                    checked={formData.billable}
                    onChange={(event) => setFormData({ ...formData, billable: event.target.checked })}
                  />
                  Billable to customer
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-10 rounded-lg border border-[#e2e8f0] px-4 text-sm font-medium text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#1a3c6e] px-5 text-sm font-medium text-white transition hover:bg-[#15325d]"
                  >
                    Submit expense
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
          <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Review</div>
                <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">Expense records</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <select
                    className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                    value={filters.projectId || ""}
                    onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value || undefined }))}
                  >
                    <option value="">All projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  className="h-10 rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  value={filters.status || ""}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value || undefined }))}
                >
                  <option value="">All status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 rounded-lg border border-[#e2e8f0] px-4 text-sm font-medium text-[#64748b] transition hover:bg-white hover:text-[#0f172a]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#64748b]">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#64748b]">No expense records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[860px] grid-cols-[1.2fr_120px_120px_1fr_120px_130px] bg-[#f8fafc] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
                <span>Expense</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Project</span>
                <span>Flags</span>
                <span>Status</span>
              </div>
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid min-w-[860px] grid-cols-[1.2fr_120px_120px_1fr_120px_130px] items-center border-t border-[#f1f5f9] px-5 py-4 text-sm transition hover:bg-[#f8fafc]"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[#0f172a]">{expense.category || "Uncategorized"}</div>
                    <div className="mt-1 truncate text-xs text-[#64748b]">{expense.notes || "No notes added"}</div>
                    {expense.receiptUrl && (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex text-xs font-medium text-[#1a3c6e] hover:underline"
                      >
                        View receipt
                      </a>
                    )}
                  </div>
                  <div className="font-semibold text-[#0f172a]">{formatMoney(expense.currency, expense.amount)}</div>
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <CalendarDays className="h-4 w-4 text-[#94a3b8]" />
                    {formatDate(expense.date)}
                  </div>
                  <div className="truncate text-[#64748b]">{expense.project?.name || expense.projectId || "N/A"}</div>
                  <div className="flex flex-wrap gap-1">
                    {expense.billable && (
                      <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                        Billable
                      </span>
                    )}
                    {expense.reimbursed && (
                      <span className="rounded-full bg-[#fdf4ff] px-[10px] py-[3px] text-[11px] font-medium text-[#7e22ce]">
                        Paid
                      </span>
                    )}
                  </div>
                  <StatusBadge status={expense.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

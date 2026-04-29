import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import type { Timesheet } from "@/types"
import { CalendarDays, Clock3, DollarSign, FileCheck2, Filter, Plus, ReceiptText } from "lucide-react"

const num = (value: any) => {
  const parsed = Number(value)
  return isFinite(parsed) ? parsed : 0
}

function formatCurrency(value: any) {
  return `$${num(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
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
  icon: typeof Clock3
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

export function TimesheetsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<{ user?: string; project?: string; status?: string }>({})
  const [draft, setDraft] = useState<Partial<Timesheet>>({
    billable: true,
    durationHours: 1,
    hourlyRate: 0,
  })

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ["timesheets", filters],
    queryFn: async () => (await timesheetsApi.getAll(filters as any)).data,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Timesheet>) => timesheetsApi.create(payload),
    onSuccess: () => {
      setDraft({ billable: true, durationHours: 1, hourlyRate: 0 })
      queryClient.invalidateQueries({ queryKey: ["timesheets"] })
    },
  })

  const summary = useMemo(() => {
    const rows = timesheets as Timesheet[]
    const totalHours = rows.reduce((sum, row) => sum + num(row.durationHours), 0)
    const billableHours = rows.filter((row) => row.billable).reduce((sum, row) => sum + num(row.durationHours), 0)
    const totalAmount = rows.reduce((sum, row) => sum + num(row.amount), 0)
    const approved = rows.filter((row) => String(row.status).toUpperCase() === "APPROVED").length
    return { totalHours, billableHours, totalAmount, approved, count: rows.length }
  }, [timesheets])

  const clearFilters = () => setFilters({})

  const submitQuickLog = () => {
    createMutation.mutate({
      ...draft,
      billable: !!draft.billable,
      durationHours: num(draft.durationHours),
      hourlyRate: num(draft.hourlyRate),
    } as Partial<Timesheet>)
  }

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-64 opacity-35 md:block">
            <svg viewBox="0 0 256 128" fill="none" className="h-full w-full">
              <rect x="24" y="64" width="86" height="44" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="142" y="20" width="84" height="52" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M62 64C86 30 124 14 178 22" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="62" cy="64" r="5" fill="#bfdbfe" />
              <circle cx="178" cy="22" r="5" fill="#93c5fd" />
              <rect x="42" y="80" width="46" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <rect x="160" y="38" width="42" height="6" rx="3" fill="rgba(255,255,255,0.58)" />
              <path d="M166 88H220" stroke="rgba(255,255,255,0.32)" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Timesheets
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Time operations
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Log work hours, review billable activity, and keep project time records ready for approvals and billing.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">
                  {summary.count} entries
                </span>
                <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">
                  {summary.approved} approved
                </span>
                <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                  {summary.billableHours} billable hours
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={submitQuickLog}
              disabled={createMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa] disabled:cursor-wait disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Saving..." : "Log time"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total hours"
            value={summary.totalHours}
            note="All visible entries"
            icon={Clock3}
            tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
          />
          <KpiCard
            label="Billable hours"
            value={summary.billableHours}
            note="Marked billable"
            icon={FileCheck2}
            tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }}
          />
          <KpiCard
            label="Timesheet value"
            value={formatCurrency(summary.totalAmount)}
            note="Logged amount"
            icon={DollarSign}
            tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
          />
          <KpiCard
            label="Approved"
            value={summary.approved}
            note="Ready for finance"
            icon={ReceiptText}
            tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Quick log</div>
              <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">Add time entry</h2>
            </div>

            <div className="grid gap-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#64748b]">Project ID</label>
                <input
                  placeholder="Project ID"
                  className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  value={draft.projectId || ""}
                  onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#64748b]">Task ID</label>
                <input
                  placeholder="Optional"
                  className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                  value={draft.taskId || ""}
                  onChange={(event) => setDraft({ ...draft, taskId: event.target.value || undefined })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Work date</label>
                  <input
                    type="date"
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                    value={draft.workDate || ""}
                    onChange={(event) => setDraft({ ...draft, workDate: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Hours</label>
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                    value={draft.durationHours || 0}
                    onChange={(event) => setDraft({ ...draft, durationHours: Number(event.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748b]">Hourly rate</label>
                  <input
                    type="number"
                    min={0}
                    className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)]"
                    placeholder="Hourly rate"
                    value={draft.hourlyRate || 0}
                    onChange={(event) => setDraft({ ...draft, hourlyRate: Number(event.target.value) })}
                  />
                </div>
                <label className="flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a]">
                  <input
                    type="checkbox"
                    checked={!!draft.billable}
                    onChange={(event) => setDraft({ ...draft, billable: event.target.checked })}
                  />
                  Billable
                </label>
              </div>

              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1a3c6e] px-5 text-sm font-medium text-white transition hover:bg-[#15325d] disabled:cursor-wait disabled:opacity-70"
                disabled={createMutation.isPending}
                onClick={submitQuickLog}
              >
                <Plus className="h-4 w-4" />
                {createMutation.isPending ? "Saving..." : "Log time"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
            <div className="border-b border-[#d8e3f2] bg-[#f8fafc] px-6 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#1a3c6e]">Review</div>
                  <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">Timesheet entries</h2>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      placeholder="Filter by project ID"
                      className="h-10 w-full rounded-lg border-[1.5px] border-[#d1d5db] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#1a3c6e] focus:shadow-[0_0_0_3px_rgba(26,60,110,0.12)] sm:w-56"
                      value={filters.project || ""}
                      onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value || undefined }))}
                    />
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

            {isLoading ? (
              <div className="p-10 text-center text-sm text-[#64748b]">Loading timesheets...</div>
            ) : timesheets.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#64748b]">No timesheet entries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid min-w-[760px] grid-cols-[1.2fr_1fr_100px_110px_110px_100px] bg-[#f8fafc] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
                  <span>Work</span>
                  <span>Date</span>
                  <span>Hours</span>
                  <span>Rate</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                {(timesheets as Timesheet[]).map((timesheet) => (
                  <div
                    key={timesheet.id}
                    className="grid min-w-[760px] grid-cols-[1.2fr_1fr_100px_110px_110px_100px] items-center border-t border-[#f1f5f9] px-5 py-4 text-sm transition hover:bg-[#f8fafc]"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[#0f172a]">
                        {timesheet.billable ? "Billable time" : "Non-billable time"}
                      </div>
                      <div className="mt-1 truncate text-xs text-[#64748b]">
                        Project {timesheet.projectId || "-"} {timesheet.taskId ? `- Task ${timesheet.taskId}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <CalendarDays className="h-4 w-4 text-[#94a3b8]" />
                      {formatDate(timesheet.workDate)}
                    </div>
                    <div className="font-medium text-[#0f172a]">{timesheet.durationHours}h</div>
                    <div className="text-[#64748b]">{formatCurrency(timesheet.hourlyRate)}/h</div>
                    <div className="font-semibold text-[#0f172a]">{formatCurrency(timesheet.amount)}</div>
                    <StatusBadge status={timesheet.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

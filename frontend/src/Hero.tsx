import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

  .os-home {
    --navy: #0f2a52;
    --primary: #1a3c6e;
    --accent: #2563eb;
    --page: #f0f4fa;
    --surface: #ffffff;
    --muted-surface: #f8fafc;
    --border: #e2e8f0;
    --border-strong: #d1d5db;
    --text: #0f172a;
    --text-secondary: #64748b;
    --text-tertiary: #94a3b8;
    --success: #16a34a;
    --warning: #f59e0b;
    --danger: #dc2626;
    min-height: 100vh;
    background: var(--page);
    color: var(--text);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow-x: hidden;
  }

  .os-home *,
  .os-home *::before,
  .os-home *::after {
    box-sizing: border-box;
  }

  .os-fade-in {
    animation: osFadeIn 420ms ease-out both;
  }

  .os-slide-in {
    animation: osSlideIn 520ms ease-out both;
  }

  .os-delay-1 { animation-delay: 80ms; }
  .os-delay-2 { animation-delay: 150ms; }
  .os-delay-3 { animation-delay: 220ms; }

  .os-card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .os-btn-primary,
  .os-btn-secondary,
  .os-btn-ghost {
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease;
  }

  .os-btn-primary {
    background: var(--primary);
    color: #fff;
  }

  .os-btn-primary:hover {
    background: #15325d;
    transform: translateY(-1px);
  }

  .os-btn-secondary {
    border: 1.5px solid var(--primary);
    color: var(--primary);
    background: transparent;
  }

  .os-btn-secondary:hover {
    background: rgba(26,60,110,0.08);
  }

  .os-btn-ghost {
    border: 0.5px solid var(--border);
    color: var(--text-secondary);
    background: transparent;
  }

  .os-btn-ghost:hover {
    background: #f8fafc;
    color: var(--text);
  }

  .os-input {
    height: 40px;
    border-radius: 8px;
    border: 1.5px solid var(--border-strong);
    background: #fff;
    color: var(--text);
    outline: none;
  }

  .os-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26,60,110,0.12);
  }

  .os-nav-link {
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-weight: 500;
    transition: color 150ms ease;
  }

  .os-nav-link:hover,
  .os-nav-link-active {
    color: #fff;
  }

  .os-sidebar-item {
    height: 40px;
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 13px;
    transition: background-color 150ms ease, color 150ms ease;
  }

  .os-sidebar-item-active {
    background: rgba(26,60,110,0.10);
    color: var(--primary);
    font-weight: 500;
  }

  .os-table-header {
    background: #f8fafc;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .os-table-row {
    min-height: 48px;
    border-bottom: 0.5px solid #f1f5f9;
    transition: background-color 150ms ease;
  }

  .os-table-row:hover {
    background: #f8fafc;
  }

  .os-preview-grid,
  .os-preview-main,
  .os-preview-panel,
  .os-table-scroll {
    min-width: 0;
  }

  .os-table-scroll {
    overflow-x: auto;
  }

  .os-table-grid {
    min-width: 620px;
  }

  .os-hero-preview {
    width: 100%;
    max-width: 100%;
  }

  .os-preview-toolbar {
    min-width: 0;
  }

  .os-preview-search {
    min-width: 0;
    max-width: 100%;
  }

  .os-doodle {
    position: relative;
    min-height: 360px;
  }

  .os-doodle-card {
    position: absolute;
    background: #fff;
    border: 0.5px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .os-doodle-card-main {
    inset: 24px 0 auto auto;
    width: min(420px, 100%);
    padding: 24px;
  }

  .os-doodle-card-small {
    left: 8px;
    top: 210px;
    width: 190px;
    padding: 16px;
  }

  .os-doodle-card-tiny {
    right: 28px;
    top: 276px;
    width: 166px;
    padding: 14px;
  }

  .os-doodle-line {
    position: absolute;
    border: 1px dashed rgba(26,60,110,0.25);
    border-radius: 999px;
    pointer-events: none;
  }

  .os-doodle-line-a {
    right: 150px;
    top: 162px;
    width: 148px;
    height: 76px;
    border-left-color: transparent;
    border-bottom-color: transparent;
    transform: rotate(8deg);
  }

  .os-doodle-line-b {
    right: 78px;
    top: 224px;
    width: 96px;
    height: 64px;
    border-right-color: transparent;
    border-top-color: transparent;
    transform: rotate(-10deg);
  }

  .os-doodle-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--accent);
  }

  @media (max-width: 1023px) {
    .os-doodle {
      min-height: 280px;
    }

    .os-doodle-card-main {
      position: relative;
      inset: auto;
      width: 100%;
    }

    .os-doodle-card-small,
    .os-doodle-card-tiny,
    .os-doodle-line,
    .os-doodle-dot {
      display: none;
    }
  }

  @keyframes osFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes osSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .os-fade-in,
    .os-slide-in {
      animation: none;
    }

    .os-btn-primary:hover {
      transform: none;
    }
  }
`

const navItems = ["Dashboard", "Projects", "Finance", "Reports"]

const stats = [
  { label: "Active projects", value: "24", trend: "+3 this month", tone: "text-[#16a34a]" },
  { label: "Hours pending", value: "186", trend: "12 approvals", tone: "text-[#f59e0b]" },
  { label: "Open expenses", value: "$8.4k", trend: "5 need review", tone: "text-[#dc2626]" },
  { label: "Ready to invoice", value: "$42k", trend: "On track", tone: "text-[#16a34a]" },
]

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "Timesheets", icon: Clock3 },
  { label: "Expenses", icon: ReceiptText },
  { label: "Financials", icon: BarChart3 },
]

const tableRows = [
  { project: "Website redesign", owner: "Aarav Mehta", status: "Active", budget: "$18,200", due: "May 12" },
  { project: "Mobile sprint", owner: "Priya Shah", status: "Review", budget: "$11,760", due: "May 18" },
  { project: "Vendor onboarding", owner: "Neha Rao", status: "Blocked", budget: "$6,420", due: "May 24" },
]

const modules = [
  {
    icon: FolderKanban,
    title: "Project workspace",
    copy: "Track milestones, tasks, owners, and delivery status from a clean manager view.",
  },
  {
    icon: Clock3,
    title: "Timesheet control",
    copy: "Review billable hours, approval status, and weekly activity without spreadsheet cleanup.",
  },
  {
    icon: ReceiptText,
    title: "Expense approvals",
    copy: "Keep submitted expenses, review notes, and finance handoffs visible in one queue.",
  },
  {
    icon: FileText,
    title: "Invoice readiness",
    copy: "Move approved work and project costs into invoice-ready summaries with less backtracking.",
  },
]

const processSteps = [
  "Create the project workspace",
  "Assign team activity and budgets",
  "Approve timesheets and expenses",
  "Review finance-ready reports",
]

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "Active"
      ? "bg-[#dcfce7] text-[#15803d]"
      : status === "Review"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
        : "bg-[#fef9c3] text-[#854d0e]"

  return <span className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${classes}`}>{status}</span>
}

export default function OneSyncLanding() {
  const navigate = useNavigate()
  const goToLogin = () => navigate("/login")

  return (
    <div className="os-home">
      <style>{styles}</style>

      <header className="sticky top-0 z-50 h-14 bg-[#0f2a52]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
          <button type="button" className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0 })}>
            <img src="/logo.png" alt="OneSync" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-[15px] font-medium text-white">OneSync</span>
          </button>

          <nav className="hidden flex-1 items-center gap-[18px] md:flex">
            {navItems.map((item, index) => (
              <a key={item} href={index === 0 ? "#overview" : "#platform"} className={`os-nav-link ${index === 0 ? "os-nav-link-active" : ""}`}>
                {item}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="os-btn-ghost inline-flex h-9 w-9 items-center justify-center border-white/20 text-white/80 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToLogin}
              className="hidden h-9 rounded-lg px-4 text-[13px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex sm:items-center"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={goToLogin}
              className="h-9 rounded-lg bg-white px-4 text-[13px] font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa]"
            >
              Open workspace
            </button>
          </div>
        </div>
      </header>

      <main id="overview" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,420px)] lg:items-start">
          <div className="os-slide-in max-w-3xl">
            <div className="mb-4 inline-flex rounded px-2 py-1 text-xs text-[#1a3c6e]" style={{ background: "#eff6ff", border: "0.5px solid #bfdbfe" }}>
              Project operations platform
            </div>
            <h1 className="max-w-xl text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#0f172a] sm:text-[32px]">
              Run projects, approvals, and finance from one clean workspace.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-[1.6] text-[#64748b]">
              OneSync gives project managers, team members, and finance users a structured place to manage work,
              capture time, approve expenses, and prepare billing records.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={goToLogin} className="os-btn-primary inline-flex items-center justify-center gap-2 px-5">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#platform" className="os-btn-secondary inline-flex items-center justify-center gap-2 px-5">
                View modules
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Role based", "Admin, project, finance"],
                ["Approval ready", "Timesheets and expenses"],
                ["Finance linked", "Invoices and vendor bills"],
              ].map(([label, value]) => (
                <div key={label} className="os-card p-[18px]">
                  <div className="mb-1 text-xs text-[#64748b]">{label}</div>
                  <div className="text-sm font-medium text-[#0f172a]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="os-doodle os-slide-in os-delay-1 min-w-0" aria-label="OneSync workflow doodle">
            <div className="os-doodle-line os-doodle-line-a" />
            <div className="os-doodle-line os-doodle-line-b" />
            <span className="os-doodle-dot right-[292px] top-[198px]" />
            <span className="os-doodle-dot right-[132px] top-[270px]" />

            <div className="os-doodle-card os-doodle-card-main">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">Today</div>
                  <div className="mt-1 text-xl font-semibold text-[#0f172a]">Operations queue</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1a3c6e]">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["Timesheet approvals", "12 pending", "bg-[#fef9c3] text-[#854d0e]"],
                  ["Expense review", "5 items", "bg-[#fee2e2] text-[#b91c1c]"],
                  ["Invoice drafts", "$42k ready", "bg-[#dcfce7] text-[#15803d]"],
                ].map(([label, value, badgeClass]) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                    <span className="min-w-0 flex-1 text-sm font-medium text-[#0f172a]">{label}</span>
                    <span className={`rounded-full px-[10px] py-[3px] text-[11px] font-medium ${badgeClass}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="os-doodle-card os-doodle-card-small">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1a3c6e]">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-base font-medium text-[#0f172a]">Team synced</div>
              <div className="mt-1 text-xs leading-[1.6] text-[#64748b]">4 roles using one project record</div>
            </div>

            <div className="os-doodle-card os-doodle-card-tiny">
              <div className="mb-2 text-xs text-[#64748b]">Budget health</div>
              <div className="text-[26px] font-semibold leading-[1.3] text-[#0f172a]">92%</div>
              <div className="mt-1 text-[11px] text-[#16a34a]">On track</div>
            </div>
          </aside>

          <div className="os-card os-hero-preview os-slide-in os-delay-1 min-w-0 overflow-hidden lg:col-span-2">
            <div className="os-preview-toolbar flex min-h-14 flex-wrap items-center gap-3 border-b border-[#e2e8f0] bg-[#0f2a52] px-4 py-3">
              <div className="min-w-0 text-[15px] font-medium text-white">Workspace overview</div>
              <div className="os-preview-search ml-auto hidden h-9 w-full max-w-80 items-center gap-2 rounded-lg bg-white px-3 md:flex">
                <Search className="h-4 w-4 text-[#94a3b8]" />
                <span className="truncate text-xs text-[#94a3b8]">Search projects, invoices...</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                <Bell className="h-4 w-4" />
              </div>
            </div>

            <div className="os-preview-grid grid min-h-[500px] lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="hidden border-r border-[#e2e8f0] bg-white p-3 lg:block">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`os-sidebar-item mb-2 flex items-center gap-2 px-3 ${item.active ? "os-sidebar-item-active" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </aside>

              <div className="os-preview-main bg-[#f0f4fa] p-4 sm:p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
                      Dashboard
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[#0f172a]">Project health</div>
                  </div>
                  <button type="button" className="os-btn-primary inline-flex max-w-full items-center justify-center gap-2 px-4">
                    <BriefcaseBusiness className="h-4 w-4" />
                    <span className="truncate">New project</span>
                  </button>
                </div>

                <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat, index) => (
                    <div key={stat.label} className={`os-card os-fade-in os-delay-${Math.min(index, 3)} bg-[#f8fafc] p-[18px]`}>
                      <div className="mb-[6px] text-xs text-[#64748b]">{stat.label}</div>
                      <div className="text-[26px] font-semibold leading-[1.3] text-[#0f172a]">{stat.value}</div>
                      <div className={`mt-1 text-[11px] ${stat.tone}`}>{stat.trend}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="os-card os-preview-panel overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
                      <div>
                        <div className="text-base font-medium text-[#0f172a]">Priority projects</div>
                        <div className="mt-1 text-xs text-[#64748b]">Current delivery and budget view</div>
                      </div>
                      <button type="button" className="os-btn-ghost hidden px-3 sm:inline-flex sm:items-center">
                        Export
                      </button>
                    </div>

                    <div className="os-table-scroll">
                      <div className="os-table-grid grid grid-cols-[1.3fr_1fr_90px_90px_72px] px-5 py-3 os-table-header">
                        <span>Project</span>
                        <span>Owner</span>
                        <span>Status</span>
                        <span>Budget</span>
                        <span className="text-right">Due</span>
                      </div>
                      {tableRows.map((row) => (
                        <div
                          key={row.project}
                          className="os-table-grid os-table-row grid grid-cols-[1.3fr_1fr_90px_90px_72px] items-center px-5 py-3 text-sm"
                        >
                          <span className="font-medium text-[#0f172a]">{row.project}</span>
                          <span className="text-[#64748b]">{row.owner}</span>
                          <span>
                            <StatusBadge status={row.status} />
                          </span>
                          <span className="text-[#0f172a]">{row.budget}</span>
                          <span className="text-right text-[#64748b]">{row.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="os-card p-[18px]">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dbeafe] text-[#1a3c6e] text-sm font-medium">
                        AM
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[#0f172a]">Aarav Mehta</div>
                        <div className="text-xs text-[#64748b]">Project Manager</div>
                      </div>
                      <span className="ml-auto rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-[#e2e8f0] pt-3">
                      <div>
                        <div className="text-[11px] text-[#94a3b8]">This week</div>
                        <div className="text-[13px] font-medium text-[#0f172a]">42h logged</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#94a3b8]">Approvals</div>
                        <div className="text-[13px] font-medium text-[#0f172a]">6 pending</div>
                      </div>
                    </div>
                    <button type="button" className="os-btn-secondary mt-4 inline-flex w-full items-center justify-center gap-2">
                      Review queue
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <article key={module.title} className={`os-card os-slide-in os-delay-${Math.min(index, 3)} p-6`}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1a3c6e]">
                <module.icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-medium text-[#0f172a]">{module.title}</h2>
              <p className="mt-2 text-sm leading-[1.6] text-[#64748b]">{module.copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.78fr]">
          <div className="os-card p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">Workflow</div>
                <h2 className="mt-2 text-xl font-semibold text-[#0f172a]">Simple operational path</h2>
              </div>
              <span className="rounded bg-[#eff6ff] px-2 py-1 text-xs text-[#1a3c6e]" style={{ border: "0.5px solid #bfdbfe" }}>
                4-stage process
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {processSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-medium text-[#1a3c6e]">
                    {index + 1}
                  </div>
                  <span className="text-sm text-[#0f172a]">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="os-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1a3c6e]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#0f172a]">Built for controlled access</h2>
            <p className="mt-3 text-sm leading-[1.6] text-[#64748b]">
              Admin, project manager, finance, and team dashboards stay separated by role while using the same
              operational records.
            </p>
            <div className="mt-5 space-y-3">
              {["Protected routes", "Role-aware navigation", "Audit-friendly records"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#0f172a]">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="os-card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">Get started</div>
            <h2 className="mt-2 text-xl font-semibold text-[#0f172a]">Continue into your OneSync workspace.</h2>
            <p className="mt-2 text-sm leading-[1.6] text-[#64748b]">
              Use the existing sign-in flow to access projects, timesheets, expenses, and finance dashboards.
            </p>
          </div>
          <button type="button" onClick={goToLogin} className="os-btn-primary inline-flex shrink-0 items-center justify-center gap-2 px-5">
            Open workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 text-xs text-[#64748b] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 border-t border-[#e2e8f0] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span>OneSync project operations</span>
          <div className="flex gap-5">
            <a href="#overview" className="hover:text-[#1a3c6e]">Overview</a>
            <a href="#platform" className="hover:text-[#1a3c6e]">Platform</a>
            <button type="button" onClick={goToLogin} className="hover:text-[#1a3c6e]">Sign in</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { projectsApi } from "@/api/projects"
import type { Project } from "@/types"

const statusStyles: Record<Project["status"], string> = {
  PLANNING: "bg-[#dbeafe] text-[#1d4ed8]",
  ACTIVE: "bg-[#dcfce7] text-[#15803d]",
  ON_HOLD: "bg-[#fef9c3] text-[#854d0e]",
  COMPLETED: "bg-[#e0f2fe] text-[#0369a1]",
  ARCHIVED: "bg-[#f1f5f9] text-[#475569]",
}

const statusLabels: Record<Project["status"], string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
}

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatDate(value?: string) {
  if (!value) return "Not set"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

function getProgress(project: Project) {
  const tasks = project.tasks || []
  if (!tasks.length) return 0
  const done = tasks.filter((task) => task.state === "DONE").length
  return Math.round((done / tasks.length) * 100)
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  note: string
  icon: typeof Briefcase
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

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"ALL" | Project["status"]>("ALL")

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await projectsApi.getAll()).data,
    refetchOnWindowFocus: true,
  })

  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesStatus = status === "ALL" || project.status === status
      const matchesQuery =
        !needle ||
        project.name.toLowerCase().includes(needle) ||
        project.code.toLowerCase().includes(needle) ||
        project.description?.toLowerCase().includes(needle)
      return matchesStatus && matchesQuery
    })
  }, [projects, query, status])

  const activeProjects = projects.filter((project) => project.status === "ACTIVE").length
  const completedProjects = projects.filter((project) => project.status === "COMPLETED").length
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budgetAmount || 0), 0)
  const totalTasks = projects.reduce((sum, project) => sum + Number(project.tasks?.length || 0), 0)

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <div className="w-full max-w-none space-y-5 px-4 py-4 pr-5 sm:px-5 lg:pl-0">
        <section className="relative overflow-hidden rounded-xl border border-[#123463] bg-[#0f2a52] p-6 shadow-[0_8px_24px_rgba(15,42,82,0.14)]">
          <div className="pointer-events-none absolute right-6 top-5 hidden h-32 w-72 opacity-35 md:block">
            <svg viewBox="0 0 288 128" fill="none" className="h-full w-full">
              <rect x="30" y="30" width="82" height="58" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <rect x="142" y="58" width="90" height="46" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
              <path d="M70 88C96 42 133 28 180 30C210 31 230 45 250 68" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="6 7" strokeLinecap="round" />
              <circle cx="70" cy="88" r="5" fill="#bfdbfe" />
              <circle cx="180" cy="30" r="5" fill="#93c5fd" />
              <path d="M50 52H92" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M162 78H210" stroke="rgba(255,255,255,0.58)" strokeWidth="6" strokeLinecap="round" />
              <path d="M162 92H198" stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70">
                Projects
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-white">
                Project portfolio
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-white/72">
                Browse delivery records, budgets, managers, schedules, and task progress from one clean workspace.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#dcfce7] px-[10px] py-[3px] text-[11px] font-medium text-[#15803d]">
                  {activeProjects} active
                </span>
                <span className="rounded-full bg-[#dbeafe] px-[10px] py-[3px] text-[11px] font-medium text-[#1d4ed8]">
                  {projects.length} total projects
                </span>
                <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[11px] font-medium text-white/80">
                  {totalTasks} tasks tracked
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/projects/new")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#1a3c6e] transition hover:bg-[#f0f4fa]"
            >
              <Plus className="h-4 w-4" />
              New project
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active projects"
            value={activeProjects}
            note="Currently in delivery"
            icon={FolderKanban}
            tone={{ card: "bg-[#eff6ff]", icon: "bg-white text-[#1a3c6e]", value: "text-[#0f2a52]", strip: "bg-[#2563eb]" }}
          />
          <StatCard
            label="Completed"
            value={completedProjects}
            note="Closed delivery records"
            icon={CheckCircle2}
            tone={{ card: "bg-[#f0fdf4]", icon: "bg-white text-[#15803d]", value: "text-[#14532d]", strip: "bg-[#16a34a]" }}
          />
          <StatCard
            label="Total budget"
            value={money(totalBudget)}
            note="Across visible projects"
            icon={Briefcase}
            tone={{ card: "bg-[#fff7ed]", icon: "bg-white text-[#c2410c]", value: "text-[#7c2d12]", strip: "bg-[#f59e0b]" }}
          />
          <StatCard
            label="Tracked tasks"
            value={totalTasks}
            note="Team execution items"
            icon={Clock3}
            tone={{ card: "bg-[#fdf4ff]", icon: "bg-white text-[#7e22ce]", value: "text-[#581c87]", strip: "bg-[#a855f7]" }}
          />
        </section>

        <section className="rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.07)]">
          <div className="flex flex-col gap-4 border-b border-[#e2e8f0] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748b]">Portfolio</div>
              <h2 className="mt-1 text-lg font-semibold leading-[1.3] text-[#0f172a]">All projects</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search projects..."
                  className="h-10 w-full rounded-lg border border-[#d8e3f2] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#1a3c6e] sm:w-72"
                />
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "ALL" | Project["status"])}
                className="h-10 rounded-lg border border-[#d8e3f2] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#1a3c6e]"
              >
                <option value="ALL">All status</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-10 text-center text-sm text-[#64748b]">
                Loading projects...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-10 text-center text-sm font-medium text-[#b91c1c]">
                {(error as Error).message || "Failed to load projects"}
              </div>
            ) : filteredProjects.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredProjects.map((project) => {
                  const progress = getProgress(project)
                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="group block rounded-xl border border-[#d8e3f2] bg-white p-5 shadow-[0_4px_14px_rgba(15,42,82,0.05)] transition hover:-translate-y-0.5 hover:border-[#1a3c6e] hover:shadow-[0_10px_24px_rgba(15,42,82,0.1)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="inline-flex rounded bg-[#eff6ff] px-2 py-1 text-[11px] font-medium text-[#1a3c6e]">
                            {project.code}
                          </div>
                          <h3 className="mt-3 truncate text-lg font-semibold text-[#0f172a]">{project.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-[1.6] text-[#64748b]">
                            {project.description || "No project description added yet."}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-[10px] py-[3px] text-[11px] font-medium ${statusStyles[project.status]}`}>
                          {statusLabels[project.status]}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-[#f8fafc] p-3">
                          <div className="flex items-center gap-2 text-xs text-[#64748b]">
                            <Users className="h-3.5 w-3.5" />
                            Manager
                          </div>
                          <div className="mt-1 truncate text-sm font-medium text-[#0f172a]">
                            {project.projectManager?.fullName || "Unassigned"}
                          </div>
                        </div>
                        <div className="rounded-lg bg-[#f8fafc] p-3">
                          <div className="flex items-center gap-2 text-xs text-[#64748b]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Start date
                          </div>
                          <div className="mt-1 text-sm font-medium text-[#0f172a]">{formatDate(project.startDate)}</div>
                        </div>
                        <div className="rounded-lg bg-[#f8fafc] p-3">
                          <div className="text-xs text-[#64748b]">Budget</div>
                          <div className="mt-1 text-sm font-medium text-[#0f172a]">{money(project.budgetAmount)}</div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-[#0f172a]">Task progress</span>
                          <span className="text-[#64748b]">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                          <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[#e2e8f0] pt-4 text-sm">
                        <span className="text-[#64748b]">{project.teamMembers?.length || 0} team members</span>
                        <span className="inline-flex items-center gap-2 font-medium text-[#1a3c6e]">
                          Open project
                          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-10 text-center">
                <FolderKanban className="mx-auto h-10 w-10 text-[#94a3b8]" />
                <h3 className="mt-3 text-base font-semibold text-[#0f172a]">No projects found</h3>
                <p className="mt-1 text-sm text-[#64748b]">Create a project or adjust the current filters.</p>
                <button
                  type="button"
                  onClick={() => navigate("/projects/new")}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1a3c6e] px-4 text-sm font-medium text-white transition hover:bg-[#0f2a52]"
                >
                  <Plus className="h-4 w-4" />
                  New project
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

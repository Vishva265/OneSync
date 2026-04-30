"use client"

import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import {
  BarChart3,
  CheckSquare,
  Clock,
  DollarSign,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Receipt,
} from "lucide-react"

const navItems = [
  { path: "/dashboard", label: "Dashboard", description: "Workspace overview", icon: LayoutDashboard, show: () => true },
  { path: "/timesheets", label: "Timesheets", description: "Logged hours", icon: Clock, show: () => true },
  { path: "/projects", label: "Projects", description: "Delivery records", icon: FolderKanban, show: () => true },
  { path: "/tasks", label: "Tasks", description: "Team execution", icon: CheckSquare, show: () => true },
  { path: "/expenses", label: "Expenses", description: "Claims and receipts", icon: Receipt, show: () => true },
  {
    path: "/expenses/approvals",
    label: "Approvals",
    description: "Manager review",
    icon: CheckSquare,
    show: (role: string) => role === "PROJECT_MANAGER" || role === "ADMIN",
  },
  {
    path: "/financials",
    label: "Financials",
    description: "Revenue and billing",
    icon: DollarSign,
    show: (role: string) => role === "ADMIN" || role === "PROJECT_MANAGER" || role === "FINANCE",
  },
  { path: "/analytics", label: "Reports", description: "Insights and metrics", icon: BarChart3, show: () => true },
]

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const role = String(user?.role || localStorage.getItem("userRole") || "").toUpperCase()
  const visibleItems = useMemo(() => navItems.filter((item) => item.show(role)), [role])

  const initials = (user?.fullName || user?.email || "OS")
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard-team"
    }
    return location.pathname.startsWith(path)
  }

  const goHome = () => navigate(role === "TEAM_MEMBER" ? "/dashboard-team" : "/dashboard")

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#0b2143] bg-[#0f2a52] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={goHome} className="flex items-center gap-3">
            <img src="/logo.png" alt="OneSync" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-[15px] font-medium text-white">OneSync</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/20 px-3 text-[13px] font-medium text-white/80"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {visibleItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-medium ${
                  active ? "bg-white/10 text-white" : "text-white/65"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <aside className="sticky top-4 z-30 ml-4 mr-3 mt-4 hidden h-[calc(100vh-32px)] w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#d8e3f2] bg-white shadow-[0_8px_24px_rgba(15,42,82,0.08)] lg:flex">
        <div className="bg-[#0f2a52] p-4 text-white">
        <button type="button" onClick={goHome} className="flex items-center gap-3">
          <img src="/logo.png" alt="OneSync" className="h-9 w-9 rounded-md object-cover" />
          <span className="text-[18px] font-semibold">OneSync</span>
        </button>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/8 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xs font-medium">
              {initials || "OS"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.fullName || user?.email || "Workspace user"}</div>
              <div className="mt-0.5 truncate text-xs capitalize text-white/60">
                {String(user?.role || role || "user").replace("_", " ").toLowerCase()}
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
        <div className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
          Menu
        </div>

        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-[#eff6ff] text-[#1a3c6e]"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-white text-[#1a3c6e] shadow-[0_1px_4px_rgba(0,0,0,0.06)]" : "bg-[#f8fafc]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-[#64748b]">{item.description}</span>
                </span>
              </button>
            )
          })}
        </nav>
        </div>

        <div className="border-t border-[#e2e8f0] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        </div>
      </aside>
    </>
  )
}

export default Navbar

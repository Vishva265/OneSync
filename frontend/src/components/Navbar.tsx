"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, Clock, FolderKanban, Receipt, DollarSign, CheckSquare } from "lucide-react"

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const role = String(user?.role || "").toUpperCase()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  // Navigation items based on role
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { path: "/timesheets", label: "Timesheets", icon: Clock, show: true },
    { path: "/projects", label: "Projects", icon: FolderKanban, show: true },
    { path: "/tasks", label: "Tasks", icon: CheckSquare, show: true },
    { path: "/expenses", label: "Expenses", icon: Receipt, show: true },
    { 
      path: "/expenses/approvals", 
      label: "Approvals", 
      icon: CheckSquare, 
      show: role === "PROJECT_MANAGER" || role === "ADMIN" 
    },
    { 
      path: "/financials", 
      label: "Financials", 
      icon: DollarSign, 
      show: role === "ADMIN" || role === "PROJECT_MANAGER" || role === "FINANCE" 
    },
  ]

  return (
    <nav className="w-full sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/dashboard")}
          >
            <img 
              src="/logo.png"
              alt="OneFlow Logo"
              className="w-9 h-9 shadow-sm transition transform group-hover:scale-105"
            />
            <span className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition">
              OneFlow
            </span>
          </div>

          {/* Right: User info + actions */}
          <div className="flex items-center gap-4">
            {user?.fullName && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                <span className="text-xs text-gray-500 capitalize">
                  {String(user.role || "").replace("_", " ").toLowerCase()}
                </span>
              </div>
            )}

            <Button
              onClick={handleLogout}
              className="border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
          {navItems.map((item) => 
            item.show ? (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap
                  ${isActive(item.path) 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ) : null
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

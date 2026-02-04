"use client"

import type React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuthStore } from "./store/auth"
import { Navbar } from "./components/Navbar.tsx"

import { LoginPage } from "./pages/LoginPage"
import DashboardTeamPage from "./pages/DashboardTeamPage"
import { ProjectPage } from "./pages/ProjectPage"
import { TimesheetsPage } from "./pages/TimesheetsPage"
import ExpensesPage from "./pages/ExpensesPage"
import ExpenseApprovalsPage from "./pages/ExpenseApprovalsPage"
import FinancialDashboard from './pages/FinancialDashboard'
import InvoiceViewPage from "./pages/InvoiceViewPage"
import VendorBillFromPoPage from "./pages/VendorBillFromPoPage"
import VendorBillViewPage from "./pages/VendorBillViewPage"
import { AnalyticsPage } from "./pages/AnalyticsPage"
import { ProfilePage } from "./pages/ProfilePage"
import ProjectCreatePage from "./pages/ProjectCreatePage"
import TasksPage from "./pages/TasksPage"
import SettingsPage from "./pages/SettingsPage"
import SignupPage from "./pages/SignupPage"
import Hero from "./Hero"
import { DashboardPage } from "./pages/DashboardPage"

const queryClient = new QueryClient()

/** Simple guard: require token; Navbar only, no sidebar */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  ) : (
    <Navigate to="/login" replace />
  )
}

/** Role-aware dashboard selector for /dashboard */
function RoleDashboard() {
  const role = (useAuthStore((s) => s.user?.role) || "").toUpperCase()
  if (role === "TEAM_MEMBER") return <Navigate to="/dashboard-team" replace />
  return <DashboardPage />
}

/** After login/signup redirect */
function AfterAuthRedirect() {
  const role = (useAuthStore((s) => s.user?.role) || "").toUpperCase()
  return role === "TEAM_MEMBER" ? (
    <Navigate to="/dashboard-team" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  )
}

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<Hero />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/after-auth" element={<AfterAuthRedirect />} />

          {/* Dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-team"
            element={
              <ProtectedRoute>
                <DashboardTeamPage />
              </ProtectedRoute>
            }
          />

          {/* Role dashboards */}
          {/* <Route
            path="/dashboard-admin"
            element={
              <ProtectedRoute>
                <DashboardAdminPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/dashboard-manager"
            element={
              <ProtectedRoute>
                <DashboardManagerPage />
              </ProtectedRoute>
            }
          /> */}

          {/* App pages */}
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute>
                <TimesheetsPage />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <FinancePage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/invoice/:soId"
            element={
              <ProtectedRoute>
                <InvoiceFromSoPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/invoice/view/:invoiceId"
            element={
              <ProtectedRoute>
                <InvoiceViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-bill/:poId"
            element={
              <ProtectedRoute>
                <VendorBillFromPoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-bill/view/:invoiceId"
            element={
              <ProtectedRoute>
                <VendorBillViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/approvals"
            element={
              <ProtectedRoute>
                <ExpenseApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials"
            element={
              <ProtectedRoute>
                <FinancialDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* NEW PROJECT (remove the extra <Routes>, keep this single Route) */}
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <ProjectCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
